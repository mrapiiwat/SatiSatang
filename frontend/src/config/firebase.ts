import { initializeApp } from 'firebase/app';
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
  type MessagePayload,
  type Messaging,
} from 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'AIzaSyBPkQnSLSu8YfG1FP-vAdMH2KqFCw66RhM',
  authDomain: 'satisatang-af51c.firebaseapp.com',
  projectId: 'satisatang-af51c',
  storageBucket: 'satisatang-af51c.firebasestorage.app',
  messagingSenderId: '507739542082',
  appId: '1:507739542082:web:a78c7902ee33810069d3db',
  measurementId: 'G-S6Q1S093H8',
};

const app = initializeApp(firebaseConfig);

const getSafeMessaging = async (): Promise<Messaging | null> => {
  try {
    const supported = await isSupported();
    if (supported) {
      return getMessaging(app);
    }
    console.warn('Firebase Messaging is not supported in this browser.');
    return null;
  } catch (error) {
    console.warn('Error checking Firebase Messaging support:', error);
    return null;
  }
};

export const requestForToken = async (): Promise<string | null> => {
  try {
    const messaging = await getSafeMessaging();
    if (!messaging) return null;

    const registration = await navigator.serviceWorker.ready;
    const currentToken = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (currentToken) {
      return currentToken;
    } else {
      return null;
    }
  } catch (error) {
    console.warn('Failed to get FCM token:', error);
    return null;
  }
};

export const onMessageListener = async (): Promise<MessagePayload | null> => {
  const messaging = await getSafeMessaging();

  if (!messaging) {
    return new Promise((resolve) => resolve(null));
  }

  return new Promise((resolve) => {
    onMessage(messaging, (payload: MessagePayload) => {
      resolve(payload);
    });
  });
};
