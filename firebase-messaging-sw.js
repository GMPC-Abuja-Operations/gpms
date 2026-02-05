// firebase-messaging-sw.js - MINIMAL WORKING VERSION
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

console.log('[SW] Service worker starting...');

firebase.initializeApp({
  apiKey: "AIzaSyBNpWwlJV-2ay7_D8_AXfM2k_WpImVIEYs",
  authDomain: "gpms-notifications.firebaseapp.com",
  projectId: "gpms-notifications",
  storageBucket: "gpms-notifications.firebasestorage.app",
  messagingSenderId: "240580625031",
  appId: "1:240580625031:web:52421c30f5f542dfd0ae22",
  measurementId: "G-D41F7DQVLP"
});

const messaging = firebase.messaging();

// CRITICAL: This MUST be called for Firebase to handle messages
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Firebase onBackgroundMessage received:', payload);
  return showNotification(payload);
});

// Also handle standard push events
self.addEventListener('push', (event) => {
  console.log('[SW] Standard push event received');
  
  let payload = {};
  try {
    payload = event.data.json();
    console.log('[SW] Push payload:', payload);
  } catch (e) {
    console.log('[SW] Error parsing push data:', e);
    payload = { notification: { title: 'GPMS', body: 'New notification' } };
  }
  
  event.waitUntil(showNotification(payload));
});

// Unified notification function
function showNotification(payload) {
  console.log('[SW] Creating notification from:', payload);
  
  let title = 'GPMS';
  let body = 'New notification';
  let data = {};
  let icon = 'https://gmpc-abuja-operations.github.io/gpms/Picture1.png';
  
  // Extract from different payload formats
  if (payload.notification) {
    title = payload.notification.title || title;
    body = payload.notification.body || body;
    data = payload.data || {};
  } else if (payload.message && payload.message.notification) {
    title = payload.message.notification.title || title;
    body = payload.message.notification.body || body;
    data = payload.message.data || {};
  } else if (payload.data) {
    title = payload.data.title || title;
    body = payload.data.body || body;
    data = payload.data;
  }
  
  console.log('[SW] Showing notification:', { title, body });
  
  const options = {
    body: body,
    icon: icon,
    badge: icon,
    data: data,
    tag: 'gpms',
    requireInteraction: true,
    actions: [{
      action: 'open',
      title: 'Open'
    }]
  };
  
  return self.registration.showNotification(title, options)
    .then(() => console.log('[SW] Notification shown'))
    .catch(err => console.error('[SW] Error showing notification:', err));
}

// Handle clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();
  
  const url = event.notification.data?.url || 'https://gmpc-abuja-operations.github.io/gpms/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('gmpc-abuja-operations.github.io') && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});

console.log('[SW] Service worker ready');
