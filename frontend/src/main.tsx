import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './i18n';
import App from './App.tsx';

const isAppBrowser = (): boolean => {
  if (typeof window === 'undefined') return false;
  const ua: string = navigator.userAgent || navigator.vendor || '';
  return /FBAN|FBAV|Instagram|Line|wv|TikTok|Twitter|MicroMessenger|Snapchat|Pinterest|LinkedInApp/i.test(
    ua,
  );
};

if ('serviceWorker' in navigator) {
  if (isAppBrowser()) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      for (const reg of regs) {
        reg.unregister();
      }
    });
  } else {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                  window.location.reload();
                }
              });
            }
          });
        })
        .catch((err) => {
          console.error('SW registration failed:', err);
        });
    });
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
