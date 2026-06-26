import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore/lite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Cinematix Sitemap Generator (Arabic Slug Strategy)
 * التحديث التلقائي والاحترافي لكافة القوائم
 */

const firebaseConfig = {
  apiKey: "AIzaSyBVK0Zla5VD05Hgf4QqExAWUuXX64odyes",
  authDomain: "cinematic-d3697.firebaseapp.com",
  projectId: "cinematic-d3697",
  storageBucket: "cinematic-d3697.firebasestorage.app",
  messagingSenderId: "247576999692",
  appId: "1:247576999692:web:309f001a211dc1b150fb29",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const BASE_URL = 'https://cinematix.watch';

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

const generateSlug = (title) => {
    if (!title) return '';
    return title
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\u0621-\u064A\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

async function generateSitemap() {
    console.log('🚀 Generating Dynamic Professional Sitemap...');
    
    try {
        const contentRef = collection(db, 'content');
        const q = query(contentRef, orderBy('updatedAt', 'desc'));
        const snapshot = await getDocs(q);
        const lastModDate = new Date().toISOString().split('T')[0];
        
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  <url>
    <loc>${BASE_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/movies</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/series</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
`;

        snapshot.forEach(doc => {
            const data = doc.data();
            const id = doc.id;
            const title = data.title || '';
            const slug = data.slug || generateSlug(title) || id;
            const type = data.type || 'movie';
            const updatedAt = data.updatedAt ? (typeof data.updatedAt === 'string' ? data.updatedAt.split('T')[0] : lastModDate) : lastModDate;
            
            if (type === 'movie') {
                xml += `  <url>
    <loc>${BASE_URL}/watch/movie/${slug}</loc>
    <lastmod>${updatedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <video:video>
      <video:thumbnail_loc>${escapeXml(data.poster || '')}</video:thumbnail_loc>
      <video:title>${escapeXml(title)}</video:title>
      <video:description>${escapeXml(data.description || title).substring(0, 500)}</video:description>
    </video:video>
  </url>\n`;
            } else {
                // Series Main URL
                xml += `  <url>
    <loc>${BASE_URL}/${type}/${slug}</loc>
    <lastmod>${updatedAt}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>\n`;

                if (data.seasons) {
                    data.seasons.forEach(season => {
                        const sNum = season.seasonNumber;
                        xml += `  <url>
    <loc>${BASE_URL}/${type}/${slug}/الموسم${sNum}</loc>
    <lastmod>${updatedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>\n`;

                        if (season.episodes) {
                            season.episodes.forEach((ep, index) => {
                                const eNum = index + 1;
                                xml += `  <url>
    <loc>${BASE_URL}/watch/${slug}/الموسم${sNum}/الحلقة${eNum}</loc>
    <lastmod>${updatedAt}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <video:video>
      <video:thumbnail_loc>${escapeXml(ep.thumbnail || data.poster)}</video:thumbnail_loc>
      <video:title>${escapeXml(`${title} - الموسم ${sNum} - الحلقة ${eNum}`)}</video:title>
      <video:description>${escapeXml(ep.description || data.description || title).substring(0, 500)}</video:description>
    </video:video>
  </url>\n`;
                            });
                        }
                    });
                }
            }
        });

        xml += `</urlset>`;
        
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const publicDir = path.resolve(__dirname, '../public');
        
        if (!fs.existsSync(publicDir)){
            fs.mkdirSync(publicDir);
        }

        fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);
        console.log(`✅ Success! Generated professional sitemap.xml.`);

    } catch (error) {
        console.error('❌ Generator Failed:', error);
        process.exit(1);
    }
}

generateSitemap();