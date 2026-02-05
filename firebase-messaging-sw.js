// firebase-messaging-sw.js - WITH CLIENTS.CLAIM()
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

console.log('[SW] Service worker loading...');

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

// CRITICAL: Force service worker to control clients immediately
self.addEventListener('activate', event => {
  console.log('[SW] Activate event - claiming clients');
  event.waitUntil(clients.claim());
});

// CRITICAL: Skip waiting during install
self.addEventListener('install', event => {
  console.log('[SW] Install event - skipping wait');
  self.skipWaiting();
});

// Handle ALL push events
self.addEventListener('push', (event) => {
  console.log('[SW] Push event triggered - showing notification');
  
  let payload = {};
  
  try {
    if (event.data) {
      payload = event.data.json();
      console.log('[SW] Push payload:', payload);
    } else {
      console.log('[SW] No data in push event');
      payload = {
        notification: {
          title: 'GPMS',
          body: 'New notification'
        }
      };
    }
  } catch (error) {
    console.error('[SW] Error parsing push data:', error);
    payload = {
      notification: {
        title: 'GPMS',
        body: 'Notification received'
      }
    };
  }
  
  // ALWAYS show notification
  event.waitUntil(showNotification(payload));
});

// Simplified notification function
function showNotification(payload) {
  console.log('[SW] showNotification called');
  
  // Extract title and body from ANY format
  let title = 'GPMS';
  let body = 'You have a new notification';
  let data = {};
  let icon = 'https://gmpc-abuja-operations.github.io/gpms/Picture1.png';
  
  if (payload.notification) {
    title = payload.notification.title || title;
    body = payload.notification.body || body;
    data = payload.data || {};
    icon = payload.notification.icon || icon;
  } else if (payload.message && payload.message.notification) {
    title = payload.message.notification.title || title;
    body = payload.message.notification.body || body;
    data = payload.message.data || {};
  } else if (payload.data) {
    title = payload.data.title || title;
    body = payload.data.body || body;
    data = payload.data;
  }
  
  console.log(`[SW] Showing: "${title}" - "${body}"`);
  
  const options = {
    body: body,
    icon: icon,
    badge: icon,
    data: data,
    tag: 'gpms',
    requireInteraction: true,
    actions: [{
      action: 'open',
      title: 'Open GPMS'
    }]
  };
  
  return self.registration.showNotification(title, options)
    .then(() => console.log('[SW] ✅ Notification shown successfully'))
    .catch(err => console.error('[SW] ❌ Failed to show notification:', err));
}

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();
  
  const url = event.notification.data?.url || 
              event.notification.data?.driveLink || 
              'https://gmpc-abuja-operations.github.io/gpms/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('gmpc-abuja-operations.github.io/gpms') && 'focus' in client) {
          return client.focus();
        }
      }
      
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

console.log('[SW] Service worker ready');
