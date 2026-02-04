// firebase-messaging-sw.js - DEBUG VERSION
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

console.log('[Service Worker] Initializing...');

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
console.log('[Service Worker] Firebase messaging initialized');

// Handle background messages from Firebase
messaging.onBackgroundMessage((payload) => {
  console.log('[Service Worker] Firebase onBackgroundMessage:', payload);
  showNotificationFromPayload(payload);
});

// Handle all push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push event received:', event);
  
  let payload = {};
  
  try {
    if (event.data) {
      payload = event.data.json();
      console.log('[Service Worker] Push data (JSON):', payload);
    } else {
      console.log('[Service Worker] No data in push event');
    }
  } catch (err) {
    console.log('[Service Worker] Error parsing JSON:', err);
    console.log('[Service Worker] Raw data text:', event.data?.text());
  }
  
  // Show notification
  showNotificationFromPayload(payload);
});

// Unified function to show notification from any payload format
function showNotificationFromPayload(payload) {
  console.log('[Service Worker] Processing payload:', payload);
  
  // Extract notification data based on format
  let title = 'GPMS Notification';
  let body = 'You have a new notification';
  let data = {};
  let icon = '/gpms/Picture1.png';
  
  // Format 1: Legacy FCM (what you're receiving)
  if (payload.notification) {
    console.log('[Service Worker] Using legacy FCM format');
    title = payload.notification.title || title;
    body = payload.notification.body || body;
    data = payload.data || {};
    icon = payload.notification.icon || icon;
  }
  
  // Format 2: FCM v1
  else if (payload.message && payload.message.notification) {
    console.log('[Service Worker] Using FCM v1 format');
    title = payload.message.notification.title || title;
    body = payload.message.notification.body || body;
    data = payload.message.data || {};
    icon = payload.message.notification.icon || icon;
  }
  
  // Format 3: Custom data in payload.data
  else if (payload.data) {
    console.log('[Service Worker] Using data-only format');
    title = payload.data.title || payload.data.taskId || title;
    body = payload.data.body || payload.data.message || body;
    data = payload.data;
  }
  
  // Log what we extracted
  console.log('[Service Worker] Extracted:', { title, body, data, icon });
  
  // Create notification options
  const options = {
    body: body,
    icon: icon,
    badge: '/gpms/Picture1.png',
    data: data,
    tag: 'gpms-notification',
    requireInteraction: true,
    timestamp: Date.now(),
    actions: [
      {
        action: 'open',
        title: 'Open GPMS'
      }
    ]
  };
  
  console.log('[Service Worker] Showing notification with options:', options);
  
  // Show the notification
  return self.registration.showNotification(title, options)
    .then(() => {
      console.log('[Service Worker] Notification shown successfully');
    })
    .catch(error => {
      console.error('[Service Worker] Error showing notification:', error);
    });
}

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click received:', event);
  console.log('[Service Worker] Notification data:', event.notification.data);
  
  event.notification.close();
  
  // Get URL from notification data or use default
  const urlToOpen = event.notification.data?.url || 
                   event.notification.data?.driveLink ||
                   'https://gmpc-abuja-operations.github.io/gpms/';
  
  console.log('[Service Worker] Opening URL:', urlToOpen);
  
  event.waitUntil(
    clients.matchAll({ 
      type: 'window',
      includeUncontrolled: true 
    }).then((clientList) => {
      // Check if there's already a window open with this URL
      for (const client of clientList) {
        if (client.url.includes('gmpc-abuja-operations.github.io/gpms') && 'focus' in client) {
          console.log('[Service Worker] Found existing window, focusing:', client.url);
          return client.focus();
        }
      }
      
      // Otherwise open a new window
      if (clients.openWindow) {
        console.log('[Service Worker] Opening new window to:', urlToOpen);
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Log that service worker is ready
console.log('[Service Worker] Service worker loaded successfully');
