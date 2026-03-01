import { useState, useEffect } from 'react';
import React from 'react';
import { type BeforeInstallPromptEvent } from '../interface/components';

const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showButton, setShowButton] = useState<boolean>(false);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem('pwa_install_dismissed');

    const handler = (e: Event) => {
      const installEvent = e as BeforeInstallPromptEvent;
      installEvent.preventDefault();
      setDeferredPrompt(installEvent);

      if (!isDismissed) {
        setShowButton(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowButton(false);
    }
  };

  const handleDismiss = () => {
    setShowButton(false);
    sessionStorage.setItem('pwa_install_dismissed', 'true');
  };

  if (!showButton) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[1000] w-max max-w-[90vw] md:max-w-md">
      <div className="flex items-center gap-3 bg-gray-800 text-white px-5 py-3 rounded-full shadow-2xl border border-gray-700 animate-bounce-subtle">
        <span className="text-sm font-light truncate">บันทึก "สติสตางค์" ลงบนหน้าจอ</span>

        <div className="flex items-center gap-2">
          <button
            onClick={handleInstall}
            className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold px-4 py-1.5 rounded-full transition-colors active:scale-95"
          >
            ติดตั้ง
          </button>

          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white p-1 transition-colors"
            aria-label="ปิด"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPWA;
