import React, { useState, useEffect, useRef } from 'react';
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
  const fetchedSettings = useRef(false);

  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.actionSetUser);
  const user = useAuthStore((state) => state.user);
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
        if (!user) {
          const resUser = await me();
          setUser(resUser.data);
        }

        if (!fetchedSettings.current) {
          const resSetting = await axios.get('/setting');

          if (resSetting.data?.data) {
            actionSetSettings(resSetting.data.data);
            console.log('Fetched Settings from API');
          }
          fetchedSettings.current = true;
        }

        if (isMounted) setPass(true);
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status !== 401) {
            console.error(error);
          }
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
  }, [token, user, setUser, actionSetSettings]);

  if (loading) return <LoadingToRedirect />;
  return pass ? element : <LoadingToRedirect />;
};

export default ProtectRoute;
