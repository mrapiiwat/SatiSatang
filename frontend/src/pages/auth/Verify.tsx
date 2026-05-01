import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { AxiosError } from 'axios';
import axios from '../../api/axios';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { showToastAlert } from '../../store/toastStore';
import type { ElysiaResponse } from '../../interface/error';
import { useTranslation } from 'react-i18next';

const Verify: React.FC = () => {
  const { t } = useTranslation();
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [allowed, setAllowed] = useState<boolean>(true);
  const [cooldown, setCooldown] = useState<number>(0);
  const navigate = useNavigate();
  const actionSetToken = useAuthStore((state) => state.actionSetToken);

  const userId = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('userId');
  }, []);

  useEffect(() => {
    const pending = sessionStorage.getItem('pendingVerification');
    const pendingId = sessionStorage.getItem('pendingUserId');

    if (!pending || !pendingId || pendingId !== userId) {
      setAllowed(false);
    }
  }, [userId]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
    setError('');
    setSuccess('');
  }, []);

  const handleVerify = useCallback(async () => {
    if (!code.trim()) {
      setError(t('verify_code_required', 'กรุณากรอกรหัสยืนยัน'));
      return;
    }
    if (code.length !== 6) {
      setError(t('verify_code_length_error', 'รหัสยืนยันต้องมี 6 หลัก'));
      return;
    }
    if (!userId) {
      setError(t('verify_user_not_found', 'ไม่พบข้อมูลผู้ใช้ กรุณาลงทะเบียนใหม่'));
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await axios.post('/verify-email', {
        userId: parseInt(userId),
        otp: code,
      });

      const { accessToken } = res.data;

      setSuccess(t('verify_success_message', 'ยืนยันอีเมลสำเร็จ! กำลังพาคุณเข้าสู่ระบบ...'));
      actionSetToken(accessToken);

      sessionStorage.removeItem('pendingVerification');
      sessionStorage.removeItem('pendingUserId');
      sessionStorage.removeItem('userEmail');

      showToastAlert(t('login_success', 'เข้าสู่ระบบสำเร็จ'), 'success');

      navigate('/user');
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const axiosError = error as AxiosError<ElysiaResponse>;
        const data = axiosError.response?.data;

        const customError = data?.errors?.find((e) => e.schema?.error)?.schema?.error;

        const errorMessage =
          customError ||
          data?.errors?.[0]?.summary ||
          data?.message ||
          t('verify_code_incorrect', 'รหัสยืนยันไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');

        setError(errorMessage);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(t('generic_error', 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [code, userId, actionSetToken, navigate, t]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !isLoading) {
        handleVerify();
      }
    },
    [handleVerify, isLoading],
  );

  const handleResendOtp = useCallback(async () => {
    if (!userId) {
      setError(t('user_not_found_resend', 'ไม่พบข้อมูลผู้ใช้'));
      return;
    }

    setIsResending(true);
    setError('');
    setSuccess('');

    try {
      const userEmail = sessionStorage.getItem('userEmail');
      if (!userEmail) {
        setError(t('email_not_found', 'ไม่พบข้อมูลอีเมล'));
        return;
      }

      await axios.post('/resend-otp', {
        email: userEmail,
      });

      setSuccess(t('resend_otp_success', 'ส่งรหัสยืนยันใหม่เรียบร้อยแล้ว'));
      setCooldown(60);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const axiosError = error as AxiosError<ElysiaResponse>;
        const data = axiosError.response?.data;

        const customError = data?.errors?.find((e) => e.schema?.error)?.schema?.error;
        const backendMessage = customError || data?.errors?.[0]?.summary || data?.message;

        if (error.response?.status === 429 && backendMessage) {
          setError(backendMessage);
        } else {
          setError(
            backendMessage ||
              t('resend_otp_failed', 'ไม่สามารถส่งรหัสยืนยันใหม่ได้ กรุณาลองใหม่อีกครั้ง'),
          );
        }
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(t('generic_error', 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'));
      }
    } finally {
      setIsResending(false);
    }
  }, [userId, t]);

  if (!allowed) {
    return (
      <div className="min-h-screen flex flex-col bg-white text-gray-700 px-4">
        <div className="flex justify-center py-8">
          <img className="w-8 h-8 object-contain" src="/SATISATANG.svg" alt="SatiSatang Logo" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-base">
              {t(
                'verify_direct_access_error',
                'หน้านี้ไม่สามารถเข้าถึงได้โดยตรง กรุณาลงทะเบียนใหม่',
              )}
            </p>
            <button
              onClick={() => (window.location.href = '/login')}
              className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t('back_to_register', 'กลับไปหน้าลงทะเบียน')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white px-6 py-8">
      <div className="flex justify-center mb-12">
        <img className="w-8 h-8 object-contain" src="/SATISATANG.svg" alt="SatiSatang Logo" />
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <div className="text-center mb-8">
          <h1 className="text-xl font-normal text-gray-900 mb-3">
            {t('verify_email_title', 'ยืนยันอีเมล')}
          </h1>
          <p className="text-sm text-gray-600 mb-2">
            {t('verify_email_sent', 'เราได้ส่งรหัสยืนยัน 6 หลักไปยังอีเมลของคุณแล้ว')}
          </p>
          <p className="text-sm text-gray-500">
            {t('verify_enter_code', 'กรุณากรอกรหัสยืนยันด้านล่าง')}
          </p>
        </div>

        <div className="space-y-5">
          <input
            type="text"
            id="code"
            value={code}
            onChange={handleCodeChange}
            onKeyPress={handleKeyPress}
            placeholder="000000"
            maxLength={6}
            className="w-full h-12 text-center text-lg font-mono tracking-wider border border-gray-300 focus:outline-none focus:border-gray-500 transition-colors"
          />

          {error && <p className="text-red-500 text-xs text-center">{error}</p>}

          {success && <p className="text-green-600 text-xs text-center">{success}</p>}

          <button
            onClick={isLoading || !code.trim() ? undefined : handleVerify}
            disabled={isLoading || !code.trim()}
            className={`w-full h-12 transition-colors ${
              isLoading || !code.trim()
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              t('confirm_btn', 'ยืนยัน')
            )}
          </button>
        </div>

        <div className="mt-6 text-center border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-600 mb-3">
            {t('not_received_code', 'ไม่ได้รับรหัสยืนยัน?')}
          </p>
          <button
            onClick={cooldown > 0 || isResending ? undefined : handleResendOtp}
            disabled={cooldown > 0 || isResending}
            className={`text-sm transition-colors ${
              cooldown > 0 || isResending
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-900 hover:text-gray-700 underline'
            }`}
          >
            {isResending
              ? t('sending', 'กำลังส่ง...')
              : cooldown > 0
                ? t('resend_in_seconds', {
                    count: cooldown,
                    defaultValue: `ส่งอีกครั้งใน ${cooldown} วินาที`,
                  })
                : t('resend_code', 'ส่งรหัสยืนยันใหม่')}
          </button>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => (window.location.href = '/login')}
            className="text-gray-500 text-sm hover:text-gray-700 transition-colors"
          >
            &larr; {t('back_to_login', 'กลับไปหน้าเข้าสู่ระบบ')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Verify;
