const admin = require('firebase-admin');

// Initialize Firebase Admin with Singleton pattern
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY 
          ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
          : undefined,
      }),
    });
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

const db = admin.firestore();

/**
 * دالة لتنظيف النصوص وجعلها متوافقة مع روابط XML
 */
const escapeXml = (unsafe) => {
  if (!unsafe) return '';
  return unsafe.toString().replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

/**
 * دالة توليد Slug احترافي يدعم العربية
 */
const generateSlug = (title) => {
  if (!title) return '';
  return title
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0621-\u064A\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/-+$/, '');
};

module.exports = async (req, res) => {
  try {
    const BASE_URL = 'https://cinematix.watch';
    const lastModDate = new Date().toISOString().split('T')[0];

    // 1. تعريف المسارات الثابتة الأساسية للموقع
    const staticRoutes = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/movies', priority: '0.9', changefreq: 'daily' },
      { url: '/series', priority: '0.9', changefreq: 'daily' },
      { url: '/kids', priority: '0.9', changefreq: 'daily' },
      { url: '/ramadan', priority: '0.9', changefreq: 'daily' },
      { url: '/soon', priority: '0.8', changefreq: 'weekly' },
      { url: '/newly-added', priority: '0.9', changefreq: 'daily' },
      { url: '/top-10', priority: '0.9', changefreq: 'daily' },
      { url: '/search', priority: '0.7', changefreq: 'daily' },
      { url: '/install-app', priority: '0.6', changefreq: 'monthly' },
      { url: '/app-download', priority: '0.6', changefreq: 'monthly' }
    ];

    // جلب كافة المحتويات من Firestore مرتبة حسب آخر تحديث
    const snapshot = await db.collection('content').orderBy('updatedAt', 'desc').get();
    
    // استخراج جميع التصنيفات الفريدة من المحتوى
    const categoriesSet = new Set();

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.categories && Array.isArray(data.categories)) {
        data.categories.forEach(cat => categoriesSet.add(cat));
      }
      if (data.genres && Array.isArray(data.genres)) {
        data.genres.forEach(g => categoriesSet.add(g));
      }
    });

    categoriesSet.forEach(cat => {
      if (cat) {
        staticRoutes.push({
          url: `/category/${encodeURIComponent(cat.toString())}`,
          priority: '0.8',
          changefreq: 'daily'
        });
      }
    });
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

    // إضافة الروابط الثابتة أولاً
    staticRoutes.forEach(route => {
      xml += `
  <url>
    <loc>${BASE_URL}${route.url}</loc>
    <lastmod>${lastModDate}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
    });

    // إضافة المحتوى الديناميكي (أفلام ومسلسلات وحلقات)
    snapshot.forEach(doc => {
      const data = doc.data();
      const id = doc.id;
      const title = data.title || '';
      const slug = data.slug || generateSlug(title) || id;
      const type = data.type || 'movie';
      const poster = data.poster || '';
      const description = data.description || title;
      
      let updatedAt = lastModDate;
      if (data.updatedAt) {
          updatedAt = typeof data.updatedAt === 'string' 
            ? data.updatedAt.split('T')[0] 
            : data.updatedAt.toDate().toISOString().split('T')[0];
      }

      if (type === 'movie') {
        // --- إضافة رابط الفيلم ---
        // تم التعديل لإضافة video:player_loc لحل مشكلة جوجل كونسول
        xml += `
  <url>
    <loc>${BASE_URL}/watch/movie/${slug}</loc>
    <lastmod>${updatedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>${escapeXml(poster)}</image:loc>
      <image:title>${escapeXml(title)}</image:title>
    </image:image>
    <video:video>
      <video:thumbnail_loc>${escapeXml(poster)}</video:thumbnail_loc>
      <video:title>${escapeXml(title)}</video:title>
      <video:description>${escapeXml(description).substring(0, 1000)}</video:description>
      <video:player_loc autoplay="ap">${escapeXml(`${BASE_URL}/embed/movie/${slug}`)}</video:player_loc>
    </video:video>
  </url>`;
      } else if (type === 'series' || type === 'program') {
        // --- إضافة رابط المسلسل الرئيسي ---
        xml += `
  <url>
    <loc>${BASE_URL}/${type}/${slug}</loc>
    <lastmod>${updatedAt}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;

        // إضافة المواسم والحلقات بشكل تلقائي
        const seasons = data.seasons || [];
        seasons.forEach(season => {
             const sNum = season.seasonNumber;
             const sTitle = season.title || `الموسم ${sNum}`;
             const sPoster = season.poster || poster;

             // رابط الموسم
             xml += `
  <url>
    <loc>${BASE_URL}/${type}/${slug}/الموسم${sNum}</loc>
    <lastmod>${updatedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
             
             // روابط الحلقات
             if (season.episodes) {
                 season.episodes.forEach((ep, idx) => {
                     const eNum = idx + 1;
                     const epTitle = ep.title || `الحلقة ${eNum}`;
                     const epThumb = ep.thumbnail || sPoster;
                     
                     // تم التعديل لإضافة video:player_loc للحلقات أيضاً
                     xml += `
  <url>
    <loc>${BASE_URL}/watch/${slug}/الموسم${sNum}/الحلقة${eNum}</loc>
    <lastmod>${updatedAt}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <video:video>
      <video:thumbnail_loc>${escapeXml(epThumb)}</video:thumbnail_loc>
      <video:title>${escapeXml(`${title} - ${sTitle} - ${epTitle}`)}</video:title>
      <video:description>${escapeXml(ep.description || description).substring(0, 1000)}</video:description>
      <video:player_loc autoplay="ap">${escapeXml(`${BASE_URL}/embed/series/${slug}/${sNum}/${eNum}`)}</video:player_loc>
    </video:video>
  </url>`;
                 });
             }
        });
      }
    });

    xml += `\n</urlset>`;

    // إعداد الترويسات للاستجابة (XML) مع تفعيل التخزين المؤقت لتحسين الأداء
    res.setHeader('Content-Type', 'text/xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate'); 
    return res.status(200).send(xml);

  } catch (error) {
    console.error('Sitemap Generation Error:', error);
    return res.status(500).send('Error generating sitemap');
  }
};