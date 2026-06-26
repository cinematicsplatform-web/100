const admin = require('firebase-admin');

// Initialize Firebase Admin
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

module.exports = async (req, res) => {
  try {
    const BASE_URL = 'https://cinematix.watch';
    
    // Fetch latest 50 items
    const snapshot = await db.collection('content')
      .orderBy('updatedAt', 'desc')
      .limit(50)
      .get();

    let itemsXml = '';

    snapshot.forEach(doc => {
      const data = doc.data();
      const id = doc.id;
      const title = data.title || '';
      const slug = data.slug || generateSlug(title) || id;
      const type = data.type || 'movie';
      const description = data.description || '';
      const poster = data.poster || '';
      
      let pubDate = new Date().toUTCString();
      if (data.updatedAt) {
          pubDate = typeof data.updatedAt === 'string' 
            ? new Date(data.updatedAt).toUTCString() 
            : data.updatedAt.toDate().toUTCString();
      }

      let link = `${BASE_URL}/watch/movie/${slug}`;
      if (type === 'series') {
        const firstSeason = data.seasons?.[0]?.seasonNumber || 1;
        link = `${BASE_URL}/series/${slug}/الموسم${firstSeason}`;
      }

      itemsXml += `
    <item>
      <title><![CDATA[${title}]]></title>
      <link>${link}</link>
      <guid isPermaLink="false">${id}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${description}]]></description>
      <media:content url="${poster}" medium="image" />
    </item>`;
    });

    const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>سينماتيكس | آخر الإضافات</title>
    <link>${BASE_URL}</link>
    <description>تابع أحدث الأفلام والمسلسلات العربية والتركية فور صدورها على منصة سينماتيكس.</description>
    <language>ar</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <image>
      <url>${BASE_URL}/android-chrome-192x192.png</url>
      <title>سينماتيكس | آخر الإضافات</title>
      <link>${BASE_URL}</link>
    </image>
    ${itemsXml}
  </channel>
</rss>`;

    res.setHeader('Content-Type', 'text/xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate'); 
    return res.status(200).send(rssXml);

  } catch (error) {
    console.error('RSS Generation API Error:', error);
    return res.status(500).send('Error generating RSS feed');
  }
};