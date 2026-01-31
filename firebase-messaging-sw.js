// firebase-messaging-sw.js - Classic script style (no modules)

self.importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
self.importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

// Use compat version to avoid module evaluation problems
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

// Background message handler
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message: ', payload);

  const notificationTitle = payload.notification?.title || 'GPMS Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification in GPMS.',
    icon: '/gpms/Picture1.png',  // Adjust path to match your subfolder
    data: {
      taskId: payload.data?.taskId,
      notificationId: payload.data?.notificationId
    },
    actions: [
      { action: 'approve', title: 'Approve' },
      { action: 'comment', title: 'Comment' }
    ]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Notification click handler
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};

  let url = '/gpms/';  // Base path for your app

  if (action === 'approve') {
    url += `?action=approve&taskId=${encodeURIComponent(data.taskId || '')}&notificationId=${encodeURIComponent(data.notificationId || '')}`;
  } else if (action === 'comment') {
    url += `?action=comment&taskId=${encodeURIComponent(data.taskId || '')}&notificationId=${encodeURIComponent(data.notificationId || '')}`;
  }

  event.waitUntil(
    clients.openWindow(url)
  );
});
