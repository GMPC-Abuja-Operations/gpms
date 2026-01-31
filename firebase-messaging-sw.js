// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/12.8.0/firebase-messaging.js');

// Your Firebase config (same as in your main script)
const firebaseConfig = {
  apiKey: "AIzaSyBNpWwlJV-2ay7_D8_AXfM2k_WpImVIEYs",
  authDomain: "gpms-notifications.firebaseapp.com",
  projectId: "gpms-notifications",
  storageBucket: "gpms-notifications.firebasestorage.app",
  messagingSenderId: "240580625031",
  appId: "1:240580625031:web:52421c30f5f542dfd0ae22",
  measurementId: "G-D41F7DQVLP"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages (when app is closed or in background)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification?.title || 'GPMS Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/Picture1.png',  // Your logo
    data: {
      taskId: payload.data?.taskId,
      notificationId: payload.data?.notificationId
    },
    actions: [
      { action: 'approve', title: 'Approve' },
      { action: 'comment', title: 'Comment' }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks (when user clicks the push notification)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const { taskId, notificationId } = event.notification.data || {};

  if (action === 'approve') {
    // Open your GPMS app with a deep link or handle approval
    clients.openWindow(`/?action=approve&taskId=${taskId}&notificationId=${notificationId}`);
  } else if (action === 'comment') {
    clients.openWindow(`/?action=comment&taskId=${taskId}&notificationId=${notificationId}`);
  } else {
    clients.openWindow('/');
  }
});
