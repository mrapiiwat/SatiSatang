import React from 'react';

interface ProtectRouteProps {
  element: React.ReactElement;
}

/*
  Original ProtectRoute implementation (commented out temporarily).
  Keep this here so you can re-enable it after backend/auth is fixed.

import React, { useState, useEffect } from 'react';
import { me } from '../api/auth';
import useAuthStore from '../store/authStore';
import LoadingToRedirect from './LoadingToRedirect';
import { AxiosError } from 'axios';

const ProtectRoute: React.FC<ProtectRouteProps> = ({ element }) => {
  const [loading, setLoading] = useState(true);
  const [pass, setPass] = useState(false);

  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.actionSetUser);

  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        setPass(false);
        setLoading(false);
        return;
      }

      try {
        const res = await me();
        setUser(res.data);
        setPass(true);
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status !== 401) {
            console.error(error);
          }
        }
        setPass(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [token, setUser]);

  if (loading) return <LoadingToRedirect />;
  return pass ? element : <LoadingToRedirect />;
};

*/

// Temporary: protection disabled so you can access UI while backend/login is down.
const ProtectRoute: React.FC<ProtectRouteProps> = ({ element }) => {
  return element;
};

export default ProtectRoute;
