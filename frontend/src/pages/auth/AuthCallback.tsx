import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { me } from '../../api/auth';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const actionSetToken = useAuthStore((state) => state.actionSetToken);
  const actionSetUser = useAuthStore((state) => state.actionSetUser);

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      actionSetToken(token);

      me()
        .then((res) => {
          actionSetUser(res.data);
          navigate('/user');
        })
        .catch((err) => {
          console.error('Failed to fetch user:', err);
          navigate('/login');
        });
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, actionSetToken, actionSetUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-gray-700 px-4">
      <div className="text-center space-y-6">
        <p className="text-base">กำลังเข้าสู่ระบบ</p>
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
};

export default AuthCallback;
