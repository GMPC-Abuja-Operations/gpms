// firebase-messaging-sw.js - UPDATED VERSION
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
  
  // Extract notification from FCM v1 format
  const notificationData = extractNotificationData(payload);
  
  const notificationTitle = notificationData.title || 'GPMS Notification';
  const notificationOptions = {
    body: notificationData.body || 'You have a new notification',
    icon: notificationData.icon || '/gpms/Picture1.png',
    badge: '/gpms/Picture1.png',
    data: notificationData.data || {},
    tag: 'gpms-notification',
    requireInteraction: true, // ADD THIS - keeps notification visible
    actions: [
      {
        action: 'open',
        title: 'Open GPMS'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Helper to extract notification from different FCM formats
function extractNotificationData(payload) {
  console.log('Extracting from payload:', payload);
  
  // Format 1: FCM v1 (from your Apps Script)
  if (payload.message && payload.message.notification) {
    return {
      title: payload.message.notification.title,
      body: payload.message.notification.body,
      data: payload.message.data || {},
      icon: payload.message.notification.icon || '/gpms/Picture1.png'
    };
  }
  
  // Format 2: Legacy FCM with notification at root
  if (payload.notification) {
    return {
      title: payload.notification.title,
      body: payload.notification.body,
      data: payload.data || {},
      icon: payload.notification.icon || '/gpms/Picture1.png'
    };
  }
  
  // Format 3: Custom data-only payload
  if (payload.data) {
    return {
      title: payload.data.title || 'GPMS Notification',
      body: payload.data.body || 'You have a new notification',
      data: payload.data,
      icon: '/gpms/Picture1.png'
    };
  }
  
  // Fallback
  return {
    title: 'GPMS Notification',
    body: JSON.stringify(payload).substring(0, 100),
    icon: '/gpms/Picture1.png'
  };
}

// Handle all push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push event received:', event);
  
  let payload = {};
  
  try {
    if (event.data) {
      payload = event.data.json();
      console.log('Push payload (JSON):', payload);
    }
  } catch (err) {
    console.log('Push data (text):', event.data?.text());
    payload = { 
      notification: { 
        title: 'GPMS Notification', 
        body: event.data ? event.data.text() : 'New notification' 
      } 
    };
  }
  
  // Extract notification data
  const notificationData = extractNotificationData(payload);
  
  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: '/gpms/Picture1.png',
    data: notificationData.data || {},
    tag: 'gpms-notification',
    requireInteraction: true, // IMPORTANT: Keeps notification visible
    timestamp: Date.now(),
    actions: [
      {
        action: 'open',
        title: 'Open GPMS'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click received:', event);
  console.log('Notification data:', event.notification.data);
  
  event.notification.close();
  
  // Get URL from notification data or use default
  const urlToOpen = event.notification.data?.url || 
                   event.notification.data?.driveLink ||
                   'https://gmpc-abuja-operations.github.io/gpms/';
  
  console.log('Opening URL:', urlToOpen);
  
  event.waitUntil(
    clients.matchAll({ 
      type: 'window',
      includeUncontrolled: true 
    }).then((clientList) => {
      // Check if there's already a window open with this URL
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          console.log('Found existing window, focusing:', client.url);
          return client.focus();
        }
      }
      
      // Otherwise open a new window
      if (clients.openWindow) {
        console.log('Opening new window to:', urlToOpen);
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
