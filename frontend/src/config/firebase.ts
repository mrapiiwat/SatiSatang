import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, type MessagePayload } from 'firebase/messaging';

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
export const messaging = getMessaging(app);

export const requestForToken = async (): Promise<string | null> => {
  try {
    const registration = await navigator.serviceWorker.ready;

    const currentToken = await getToken(messaging, {
      vapidKey: "BG9eXx-9t6hC0SSNuao5W9m1m7XMO4B9-IAoqSKXwUaBbAw_ZUvitGM2JE0b9yI13_ZWC7dKst-H1Js_oVgzrHY",
      serviceWorkerRegistration: registration,
    });

    if (currentToken) {
      return currentToken;
    } else {
      return null;
    }
  } catch {
    return null;
  }
};

export const onMessageListener = (): Promise<MessagePayload> =>
  new Promise((resolve) => {
    onMessage(messaging, (payload: MessagePayload) => {
      resolve(payload);
    });
  });
