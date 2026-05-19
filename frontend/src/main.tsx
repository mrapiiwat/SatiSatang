import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './i18n';
import App from './App.tsx';

window.onerror = function (message, source, lineno) {
  alert('JS Error: ' + message + ' at ' + source + ':' + lineno);
  return false;
};

const isAppBrowser = (): boolean => {
  const ua: string = navigator.userAgent || navigator.vendor || '';
  return /FBAN|FBAV|Instagram|Line|wv|TikTok|Twitter|MicroMessenger|Snapchat|Pinterest|LinkedInApp/i.test(
    ua,
  );
};

if ('serviceWorker' in navigator) {
  if (isAppBrowser()) {
    console.log('App browser detected, unregistering service workers');
    navigator.serviceWorker.getRegistrations().then((regs) => {
      for (const reg of regs) reg.unregister();
    });
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
