import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Logo from '../../../public/SATISATANG.svg';
import { AxiosError } from 'axios';
import axios from '../../api/axios';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const Verify = () => {
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [allowed, setAllowed] = useState<boolean>(true);
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

  const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
    setError('');
    setSuccess('');
  }, []);

  const handleVerify = useCallback(async () => {
    if (!code.trim()) {
      setError('กรุณากรอกรหัสยืนยัน');
      return;
    }
    if (code.length !== 6) {
      setError('รหัสยืนยันต้องมี 6 หลัก');
      return;
    }
    if (!userId) {
      setError('ไม่พบข้อมูลผู้ใช้ กรุณาลงทะเบียนใหม่');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await axios.post(`${API_URL}/api/verify-email`, {
        userId: parseInt(userId),
        otp: code,
      });

      const { accessToken } = res.data;

      setSuccess('ยืนยันอีเมลสำเร็จ! กำลังพาคุณเข้าสู่ระบบ...');

      actionSetToken(accessToken);

      sessionStorage.removeItem('pendingVerification');
      sessionStorage.removeItem('pendingUserId');

      navigate('/user');
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        setError(error.response?.data?.message || 'รหัสยืนยันไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setIsLoading(false);
    }
  }, [code, userId, actionSetToken, navigate]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !isLoading) {
        handleVerify();
      }
    },
    [handleVerify, isLoading],
  );

  if (!allowed) {
    return (
      <div className="min-h-screen flex flex-col bg-white text-gray-700 px-4">
        <div className="flex justify-center py-8">
          <img className="w-8 h-8 object-contain" src={Logo} alt="SatiSatang Logo" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-base">หน้านี้ไม่สามารถเข้าถึงได้โดยตรง กรุณาลงทะเบียนใหม่</p>
            <button
              onClick={() => (window.location.href = '/login')}
              className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              กลับไปหน้าลงทะเบียน
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white px-6 py-8">
      <div className="flex justify-center mb-12">
        <img className="w-8 h-8 object-contain" src={Logo} alt="SatiSatang Logo" />
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <div className="text-center mb-8">
          <h1 className="text-xl font-normal text-gray-900 mb-3">ยืนยันอีเมล</h1>
          <p className="text-sm text-gray-600 mb-2">
            เราได้ส่งรหัสยืนยัน 6 หลักไปยังอีเมลของคุณแล้ว
          </p>
          <p className="text-sm text-gray-500">กรุณากรอกรหัสยืนยันด้านล่าง</p>
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

          {error && (
            <div className="border border-red-200 bg-red-50 p-3">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {success && (
            <div className="border border-green-200 bg-green-50 p-3">
              <p className="text-green-600 text-sm text-center">{success}</p>
            </div>
          )}

          <button
            onClick={isLoading || !code.trim() ? undefined : handleVerify}
            disabled={isLoading || !code.trim()}
            className={`w-full h-12 transition-colors ${isLoading || !code.trim()
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              'ยืนยัน'
            )}
          </button>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => (window.location.href = '/login')}
            className="text-gray-500 text-sm hover:text-gray-700 transition-colors"
          >
            ← กลับไปหน้าเข้าสู่ระบบ
          </button>
        </div>
      </div>
    </div>
  );
};

export default Verify;
