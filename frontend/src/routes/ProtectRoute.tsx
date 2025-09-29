import React, { useState, useEffect } from 'react';
import { me } from '../api/auth';
import useAuthStore from '../store/authStore';
import LoadingToRedirect from './LoadingToRedirect';

interface ProtectRouteProps {
  element: React.ReactElement;
}

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
        console.error(error);
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

export default ProtectRoute;
