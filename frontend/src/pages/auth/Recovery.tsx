import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import axios from '../../api/axios';
import { AxiosError } from 'axios';
import { showToastAlert } from '../../store/toastStore';
import { IoMailOutline } from 'react-icons/io5';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import type { ElysiaResponse } from '../../interface/error';
import { useTranslation } from 'react-i18next';

const Recovery: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email');
  const email = emailParam ? decodeURIComponent(emailParam) : null;

  useEffect(() => {
    const verify = async () => {
      if (!email) {
        navigate('/login');
        return;
      }
      try {
        const res = await axios.post('/validate-recovery', { email });
        if (!res.data.valid) {
          navigate('/login');
        }
      } catch {
        navigate('/login');
      }
    };

    verify();
  }, [email, navigate]);

  const handleResendEmail = async () => {
    if (!email) return;

    setLoading(true);
    try {
      await axios.post(`/forgot-password`, { email });
      showToastAlert(t('email_sent_successfully', 'ส่งอีเมลเรียบร้อยแล้ว'), 'success');
      setSent(true);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const axiosError = error as AxiosError<ElysiaResponse>;
        const data = axiosError.response?.data;

        const customError = data?.errors?.find((e) => e.schema?.error)?.schema?.error;

        const errorMessage =
          customError ||
          data?.errors?.[0]?.summary ||
          data?.message ||
          t('generic_error', 'เกิดข้อผิดพลาด');

        showToastAlert(errorMessage, 'error');
      } else {
        showToastAlert(t('generic_error', 'เกิดข้อผิดพลาด'), 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    sessionStorage.removeItem('userEmail');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center font-ibm text-gray-900 px-4">
      <div className="absolute top-6 w-full flex justify-center">
        <Logo />
      </div>

      <div className="bg-white rounded-2xl p-8 w-full max-w-md text-center animate-fadeIn">
        <IoMailOutline className="text-blue-600 text-6xl mb-4 mx-auto animate-fadeIn" />
        <h1 className="text-2xl font-bold mb-4">{t('check_your_email', 'เช็กอีเมลของคุณ')}</h1>
        <p
          className="text-gray-600 mb-6"
          dangerouslySetInnerHTML={{
            __html: t(
              'reset_link_sent',
              'เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว <br /> โปรดตรวจสอบกล่องขาเข้า (Inbox) หรือ โฟลเดอร์ Spam',
            ),
          }}
        />

        <button
          onClick={handleBackToLogin}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition w-full mb-4"
        >
          {t('back_to_login', 'กลับไปหน้าเข้าสู่ระบบ')}
        </button>

        {!sent ? (
          <>
            <p className="text-sm text-gray-500 mb-2 mt-4">
              {t('if_no_email_resend', 'หากไม่ได้รับอีเมล คุณสามารถส่งใหม่ได้')}
            </p>
            <button
              onClick={handleResendEmail}
              disabled={loading}
              className={`text-blue-600 hover:underline flex items-center justify-center gap-2 text-sm mx-auto ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <AiOutlineLoading3Quarters className="animate-spin" />
                  {t('sending', 'กำลังส่ง...')}
                </>
              ) : (
                t('resend_email', 'ส่งอีเมลอีกครั้ง')
              )}
            </button>
          </>
        ) : (
          <p className="text-gray-500 font-medium mt-4">
            {t('email_sent_successfully', 'ส่งอีเมลเรียบร้อยแล้ว')}
          </p>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Recovery;
