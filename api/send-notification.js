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

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  const { title, body, image, targetUrl, type = 'new_content', topic, targetToken, contentId: directContentId, dataOnly } = req.body;

  if (!title || !body) {
    return res.status(400).json({ success: false, error: 'Title and body are required.' });
  }

  try {
    let contentId = directContentId || '';
    if (!contentId && targetUrl && targetUrl !== '/') {
      const cleanUrl = String(targetUrl).split('?')[0].split('#')[0];
      const parts = cleanUrl.split('/').filter(p => p);
      if (parts.length > 0) {
        contentId = parts[parts.length - 1];
      }
    }

    const payload = {};

    if (!dataOnly) {
      payload.notification = {
        title: title,
        body: body,
      };
      if (image) {
        payload.notification.imageUrl = String(image);
      }
    }

    payload.data = {
      title: String(title),
      message: String(body),
      click_action: "FLUTTER_NOTIFICATION_CLICK",
      targetUrl: String(targetUrl || '/'),
      type: String(type),
      broadcastId: String(Date.now()),
      contentId: String(contentId || ''),
      image: image ? String(image) : '',
      picture: image ? String(image) : '',
      imageUrl: image ? String(image) : '',
      pic: image ? String(image) : '',
    };
    
    let response;
    
    // Send to specific token if provided, else send to topic
    if (targetToken) {
      payload.token = targetToken;
      response = await admin.messaging().send(payload);
    } else {
      payload.topic = topic || 'all_users';
      response = await admin.messaging().send(payload);
    }

    return res.status(200).json({ 
      success: true, 
      messageId: response, 
      message: targetToken ? 'Notification sent successfully to individual device' : 'Notification sent successfully to topic: ' + payload.topic 
    });

  } catch (error) {
    console.error('Push Notification API Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
