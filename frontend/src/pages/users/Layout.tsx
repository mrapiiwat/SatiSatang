import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../components/user/Navbar';
import ToastAlert from '../../components/ToastAlert';
import useSettingStore from '../../store/settingStore';

const Layout: React.FC = () => {
  const { userId, isNotificationEnabled, actionSyncFCMToken } = useSettingStore();

  useEffect(() => {
    actionSyncFCMToken();
  }, [userId, isNotificationEnabled, actionSyncFCMToken]);

  return (
    <div className="min-h-screen bg-white dark:bg-black-900 transition-colors duration-300">
      <Navbar />
      <ToastAlert />
      <div className="pt-20">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
