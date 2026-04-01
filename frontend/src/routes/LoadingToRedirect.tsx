import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Logo from '../components/Logo';
import { useTranslation } from 'react-i18next';

const LoadingToRedirect: React.FC = () => {
  const { t } = useTranslation();
  const [count, setCount] = useState(1);
  const [redirect, setRedirect] = useState(false);
  const actionLogout = useAuthStore((state) => state.actionLogout);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((currentCount) => {
        if (currentCount === 1) {
          clearInterval(interval);
          setRedirect(true);
        }
        return currentCount - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (redirect) {
    actionLogout();
    return <Navigate to="/login" />;
  }

  return (
    <div className="p-6">
      <Logo />
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-700 px-4">
        <div className="text-center space-y-6">
          <p className="text-base">
            {
              t('redirecting_in_seconds', 'กำลังนำคุณกลับไปยังหน้าแรกใน {{count}} วินาที').split(
                '{{count}}',
              )[0]
            }
            <span className="font-medium">{count}</span>
            {
              t('redirecting_in_seconds', 'กำลังนำคุณกลับไปยังหน้าแรกใน {{count}} วินาที').split(
                '{{count}}',
              )[1]
            }
          </p>
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingToRedirect;
