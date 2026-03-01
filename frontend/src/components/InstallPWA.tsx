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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-max max-w-[calc(100vw-2rem)]">
      <div className="flex items-center gap-3 bg-gray-900 rounded-full px-4 py-2.5 shadow-lg text-sm whitespace-nowrap">
        <span className="text-gray-300">
          เพิ่ม <span className="text-white font-medium">สติสตางค์</span> ลงหน้าจอ
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleInstall}
            className="text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 active:scale-95 transition-all rounded-full px-4 py-1.5"
          >
            ติดตั้ง
          </button>

          <button
            onClick={handleDismiss}
            aria-label="ปิด"
            className="p-1 text-gray-500 hover:text-gray-300 transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              viewBox="0 0 24 24"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPWA;
