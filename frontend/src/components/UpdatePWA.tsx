import { useEffect, useState } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRegisterSW } from 'virtual:pwa-register/react';

const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000;

const isStandalone = (): boolean => {
  if (typeof window === 'undefined') return false;
  const mediaStandalone = window.matchMedia?.('(display-mode: standalone)').matches;
  const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  return Boolean(mediaStandalone || iosStandalone);
};

const UpdatePWA: React.FC = () => {
  const { t } = useTranslation();
  const [isPWA, setIsPWA] = useState<boolean>(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      setInterval(() => {
        registration.update().catch(() => {});
      }, UPDATE_CHECK_INTERVAL);
    },
  });

  useEffect(() => {
    setIsPWA(isStandalone());
    const mql = window.matchMedia('(display-mode: standalone)');
    const onChange = (e: MediaQueryListEvent) => setIsPWA(e.matches);
    mql.addEventListener?.('change', onChange);
    return () => mql.removeEventListener?.('change', onChange);
  }, []);

  if (!isPWA || !needRefresh) return null;

  const handleUpdate = async () => {
    await updateServiceWorker(true);
  };

  const handleDismiss = () => {
    setNeedRefresh(false);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-max max-w-[calc(100vw-2rem)]">
      <div className="flex items-center gap-3 bg-gray-900 rounded-full px-4 py-2.5 shadow-lg text-sm whitespace-nowrap">
        <span className="text-gray-300">
          {t('update_pwa_text_prefix', 'มีเวอร์ชันใหม่ของ')}{' '}
          <span className="text-white font-medium">{t('satisatang', 'สติสตางค์')}</span>
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleUpdate}
            className="text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 active:scale-95 transition-all rounded-full px-4 py-1.5"
          >
            {t('update_btn', 'อัปเดต')}
          </button>

          <button
            onClick={handleDismiss}
            aria-label={t('close_btn', 'ปิด')}
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

export default UpdatePWA;
