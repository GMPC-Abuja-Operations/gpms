// firebase-messaging-sw.js - Service Worker for FCM background messages

importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

// Your Firebase config (copy from Firebase Console → Project Settings → General → Your apps → Web → Config)
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

// Handle background messages (when app is closed/background)
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  // Use notification payload if present, fallback to data
  const notification = payload.notification || {};
  const data = payload.data || {};

  const title = notification.title || data.title || 'GPMS Notification';
  const options = {
    body: notification.body || data.body || data.message || 'You have a new update in GPMS.',
    icon: '/Picture1.png',               // Root-relative path to your logo
    badge: '/Picture1.png',              // Optional badge
    tag: data.notificationId || 'gpms-notification', // Prevent duplicates
    renotify: true,                      // Replace existing notification with same tag
    data: {
      url: data.url || '/gpms/',         // Fallback to app root
      taskId: data.taskId,
      notificationId: data.notificationId
    },
    actions: [
      { action: 'approve', title: 'Approve' },
      { action: 'comment', title: 'Comment' }
    ]
  };

  // Make sure notification shows even if promise rejects
  return self.registration.showNotification(title, options);
});

// Handle notification click (open app or deep link)
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};

  let targetUrl = data.url || '/gpms/';  // Root of your app

  // Optional: Add deep linking based on action
  if (action === 'approve' && data.taskId) {
    targetUrl += `?action=approve&taskId=${encodeURIComponent(data.taskId)}&notificationId=${encodeURIComponent(data.notificationId || '')}`;
  } else if (action === 'comment' && data.taskId) {
    targetUrl += `?action=comment&taskId=${encodeURIComponent(data.taskId)}&notificationId=${encodeURIComponent(data.notificationId || '')}`;
  }

  // Focus existing tab or open new one
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        for (const client of clientList) {
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
