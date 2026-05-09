importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

const firebaseConfig = {
  apiKey: 'AIzaSyBPkQnSLSu8YfG1FP-vAdMH2KqFCw66RhM',
  authDomain: 'satisatang-af51c.firebaseapp.com',
  projectId: 'satisatang-af51c',
  storageBucket: 'satisatang-af51c.firebasestorage.app',
  messagingSenderId: '507739542082',
  appId: '1:507739542082:web:a78c7902ee33810069d3db',
  measurementId: 'G-S6Q1S093H8',
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.data?.title || payload.notification?.title || 'สติสตางค์';
  const body = payload.data?.body || payload.notification?.body || '';

  const notificationOptions = {
    body: body,
    icon: '/logo/192-white.svg',
    tag: 'satisatang-notification',
    renotify: false,
  };

  return self.registration.showNotification(title, notificationOptions);
});
