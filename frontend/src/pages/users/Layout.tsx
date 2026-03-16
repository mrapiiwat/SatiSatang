import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../components/user/Navbar';
import ToastAlert from '../../components/ToastAlert';
import { requestForToken } from '../../config/firebase';
import useSettingStore from '../../store/settingStore';
import useAuthStore from '../../store/authStore';
import axios from '../../api/axios';

const Layout: React.FC = () => {
  const { user } = useAuthStore();
  const { isNotificationEnabled } = useSettingStore();

  useEffect(() => {
    const syncFCMToken = async () => {
      if (user && isNotificationEnabled) {
        try {
          if ('Notification' in window && Notification.permission === 'granted') {
            const currentToken = await requestForToken();

            if (currentToken) {
              await axios.post('/notification/token', { token: currentToken });
            }
          }
        } catch (error) {
          console.error('Failed to sync notification token:', error);
        }
      }
    };

    syncFCMToken();
  }, [user, isNotificationEnabled]);
  return (
    <>
      <Navbar />
      <ToastAlert />
      <div className="pt-20">
        <Outlet />
      </div>
    </>
  );
};

export default Layout;
