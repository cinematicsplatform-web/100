const admin = require('firebase-admin');
const { google } = require('googleapis');
const axios = require('axios');

// Initialize Firebase Admin (Singleton pattern)
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
    console.error('Firebase Admin init error:', error);
  }
}

/**
 * دالة طلب فهرسة سريعة من Google Indexing API (وأيضاً IndexNow لمحركات البحث الأخرى)
 */
module.exports = async (req, res) => {
  // يفضل تأمين هذا الـ API بمفتاح سري
  const { url, secret } = req.body || req.query;

  if (secret !== process.env.INDEXING_SECRET) {
      return res.status(401).json({ error: "Unauthorized" });
  }

  if (!url) {
      return res.status(400).json({ error: "URL is required for indexing" });
  }

  const results = {};

  // 1. Google Indexing API
  try {
    if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      const jwtClient = new google.auth.JWT(
        process.env.FIREBASE_CLIENT_EMAIL,
        null,
        process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        ['https://www.googleapis.com/auth/indexing'],
        null
      );

      await jwtClient.authorize();

      const response = await axios.post(
        'https://indexing.googleapis.com/v3/urlNotifications:publish',
        {
          url: url,
          type: 'URL_UPDATED'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtClient.credentials.access_token}`
          }
        }
      );
      results.google = response.data;
    } else {
      results.google = "Skipped (No credentials)";
    }
  } catch (error) {
    console.error('Google Indexing API Error:', error.response?.data || error.message);
    results.google = { error: error.message };
  }

  // 2. IndexNow API (Bing, Yandex, Seznam)
  try {
    const host = new URL(url).hostname;
    // يجب وضع مفتاح IndexNow في المتغيرات (مثل: 1234567890abcdef)
    const indexNowKey = process.env.INDEXNOW_KEY || 'cinematix-indexnow-key';
    
    const indexNowRes = await axios.get(`https://api.indexnow.org/indexnow?url=${encodeURIComponent(url)}&key=${indexNowKey}`);
    results.indexnow = indexNowRes.status === 200 ? "Success" : "Failed";
  } catch (error) {
    results.indexnow = { error: error.message };
  }

  return res.status(200).json({ success: true, url, results });
};
