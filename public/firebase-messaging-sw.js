
/* public/firebase-messaging-sw.js */
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBVK0Zla5VD05Hgf4QqExAWUuXX64odyes", 
  authDomain: "cinematic-d3697.firebaseapp.com",
  projectId: "cinematic-d3697", 
  storageBucket: "cinematic-d3697.firebasestorage.app", 
  messagingSenderId: "247576999692",
  appId: "1:247576999692:web:309f001a211dc1b150fb29", 
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

/**
 * معالج الإشعارات في الخلفية
 * هذا الجزء هو المسؤول عن إظهار التنبيه في شريط الإشعارات العلوي للهاتف
 */
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // استخراج البيانات من الحمولة المرسلة
  const notificationTitle = payload.notification?.title || payload.data?.title || "تنبيه جديد من سينماتيكس";
  const notificationBody = payload.notification?.body || payload.data?.body || "لديك تحديث جديد في المنصة، اكتشفه الآن.";
  const notificationIcon = payload.notification?.icon || payload.data?.icon || '/android-chrome-192x192.png';
  const notificationImage = payload.notification?.image || payload.data?.image || null;
  
  const notificationOptions = {
    body: notificationBody,
    icon: notificationIcon,
    image: notificationImage,
    badge: '/favicon-32x32.png',
    data: {
        url: payload.data?.url || '/',
        broadcastId: payload.data?.broadcastId || 'cinematix-alert'
    },
    tag: payload.data?.broadcastId || 'cinematix-global-alert',
    renotify: true,
    dir: 'rtl',
    lang: 'ar'
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// معالج الضغط على الإشعار للتوجه للرابط المحدد
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  let targetUrl = event.notification.data?.url || '/';
  
  if (targetUrl.startsWith('/')) {
      targetUrl = self.location.origin + targetUrl;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
