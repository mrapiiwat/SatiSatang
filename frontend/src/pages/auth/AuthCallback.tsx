import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { showToastAlert } from '../../store/toastStore';
import { me } from '../../api/auth';
import { useTranslation } from 'react-i18next';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const actionSetToken = useAuthStore((state) => state.actionSetToken);
  const actionSetUser = useAuthStore((state) => state.actionSetUser);
  const { t } = useTranslation();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      actionSetToken(token);

      me()
        .then((res) => {
          actionSetUser(res.data);
          showToastAlert(t('login_success', 'เข้าสู่ระบบสำเร็จ'), 'success');
          navigate('/user');
        })
        .catch((err) => {
          console.error('Failed to fetch user:', err);
          showToastAlert(t('login_failed', 'เข้าสู่ระบบล้มเหลว'), 'error');
          navigate('/login');
        });
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, actionSetToken, actionSetUser, t]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-gray-700 px-4">
      <div className="text-center space-y-6">
        <p className="text-base">{t('logging_in', 'กำลังเข้าสู่ระบบ')}</p>
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
};

export default AuthCallback;
