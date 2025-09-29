import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const LoadingToRedirect: React.FC = () => {
  const [count, setCount] = useState(3);
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
    <div className="min-h-screen flex items-center justify-center bg-white text-gray-700 px-4">
      <div className="text-center space-y-6">
        <h1 className="text-2xl font-normal">ไม่มีสิทธิ์เข้าถึงหน้านี้</h1>
        <p className="text-base">
          กำลังนำคุณกลับไปยังหน้าแรกใน <span className="font-medium">{count}</span> วินาที
        </p>
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
};

export default LoadingToRedirect;
