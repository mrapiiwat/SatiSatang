import React, { useState, useEffect } from 'react';
import { me } from '../api/auth';
import useAuthStore from '../store/authStore';
import LoadingToRedirect from './LoadingToRedirect';
import { AxiosError } from 'axios';
import axios from '../api/axios';
import useSettingStore from '../store/settingStore';

interface ProtectRouteProps {
  element: React.ReactElement;
}

const ProtectRoute: React.FC<ProtectRouteProps> = ({ element }) => {
  const [loading, setLoading] = useState(true);
  const [pass, setPass] = useState(false);

  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.actionSetUser);
  const actionSetSettings = useSettingStore((state) => state.actionSetSettings);

  useEffect(() => {
    let isMounted = true;

    const checkAuthAndFetchSettings = async () => {
      if (!token) {
        if (isMounted) {
          setPass(false);
          setLoading(false);
        }
        return;
      }

      try {
        let currentUser = useAuthStore.getState().user;
        if (!currentUser) {
          const resUser = await me();
          currentUser = resUser.data;
          setUser(currentUser);
        }

        const currentUserId = String(currentUser?.id);
        const settingsStore = useSettingStore.getState();

        if (!settingsStore.userId || String(settingsStore.userId) !== currentUserId) {
          const resSetting = await axios.get('/setting');
          if (resSetting.data?.data) {
            actionSetSettings({ ...resSetting.data.data, userId: currentUserId });
          }
        }
        if (isMounted) setPass(true);
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status !== 401) {
          console.error(error);
        }
        if (isMounted) setPass(false);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkAuthAndFetchSettings();

    return () => {
      isMounted = false;
    };
  }, [token, actionSetSettings, setUser]);

  if (loading) return <LoadingToRedirect />;
  return pass ? element : <LoadingToRedirect />;
};

export default ProtectRoute;
