// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

// Initialize Firebase
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

// Handle background messages from Firebase
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Firebase background message:', payload);
  
  const notificationTitle = payload.notification?.title || 'GPMS Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/gpms/Picture1.png',
    badge: '/gpms/Picture1.png',
    data: payload.data || {},
    tag: 'gpms-notification'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle all push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push event received:', event);
  
  let data = {};
  
  try {
    if (event.data) {
      data = event.data.json();
      console.log('Push data (JSON):', data);
    }
  } catch (err) {
    // If not JSON, try text
    console.log('Push data (text):', event.data?.text());
    data = {
      title: 'GPMS Notification',
      body: event.data ? event.data.text() : 'New notification',
      icon: '/gpms/Picture1.png'
    };
  }
  
  const options = {
    body: data.body || 'You have a new notification',
    icon: data.icon || '/gpms/Picture1.png',
    badge: '/gpms/Picture1.png',
    data: data.data || {},
    tag: data.tag || 'gpms-notification',
    timestamp: data.timestamp || Date.now()
  };
  
  event.waitUntil(
    self.registration.showNotification(
      data.title || 'GPMS Notification',
      options
    )
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click received:', event);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || 
                   'https://gmpc-abuja-operations.github.io/gpms/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
