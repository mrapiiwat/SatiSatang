import React, { useState, useCallback, useMemo } from 'react';
import Logo from '../../../public/SATISATANG.svg';
import { AxiosError } from 'axios';
import axios from '../../api/axios';

// Move constants outside component
const API_URL = import.meta.env.VITE_API_URL;

const Verify = () => {
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Get userId from URL params
  const userId = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('userId');
  }, []);

  // Handle code input change
  const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6); // Only numbers, max 6 digits
    setCode(value);
    setError('');
    setSuccess('');
  }, []);

  // Verify email with code
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
      await axios.post(`${API_URL}/api/verify-email`, {
        userId: parseInt(userId),
        otp: code,
      });

      setSuccess('ยืนยันอีเมลสำเร็จ! กำลังพาคุณเข้าสู่ระบบ...');

      // Redirect to home or dashboard after success
      setTimeout(() => {
        window.location.href = '/dashboard'; // หรือหน้าที่ต้องการ
      }, 2000);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error('Verification error:', error);
        if (error.response?.data?.message) {
          setError(error.response.data.message);
        } else {
          setError('รหัสยืนยันไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
        }
      } else if (error instanceof Error) {
        console.error('Verification error:', error);
        setError(error.message);
      } else {
        console.error('Unknown error:', error);
        setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setIsLoading(false);
    }
  }, [code, userId]);

  // Handle Enter key press
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !isLoading) {
        handleVerify();
      }
    },
    [handleVerify, isLoading],
  );

  // Memoize button class
  const verifyButtonClass = useMemo(
    () =>
      `flex items-center justify-center h-16 px-6 rounded-full gap-7 transition-colors ${
        isLoading || !code.trim()
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-[#5300E8] hover:bg-[#4803c7] cursor-pointer'
      }`,
    [isLoading, code],
  );

  return (
    <div className="p-6 min-h-screen flex flex-col">
      <div className="flex justify-center">
        <img className="w-8 object-contain" src={Logo} alt="SatiSatang Logo" />
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">ยืนยันอีเมล</h1>
          <p className="text-gray-600">เราได้ส่งรหัสยืนยัน 6 หลักไปยังอีเมลของคุณแล้ว</p>
          <p className="text-sm text-gray-500 mt-2">กรุณากรอกรหัสยืนยันด้านล่าง</p>
        </div>

        <div className="space-y-6">
          {/* Code Input */}
          <div className="relative w-full">
            <input
              type="text"
              id="code"
              value={code}
              onChange={handleCodeChange}
              onKeyPress={handleKeyPress}
              placeholder="000000"
              maxLength={6}
              className="w-full h-16 text-center text-2xl font-mono tracking-widest border border-[#CECDCA] rounded-full focus:outline-none focus:border-[#5300E8] transition-colors"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-600 text-sm text-center">{success}</p>
            </div>
          )}

          {/* Verify Button */}
          <div
            onClick={isLoading || !code.trim() ? undefined : handleVerify}
            className={verifyButtonClass}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <p className="text-xl font-semibold text-[#FEFCFA]">ยืนยัน</p>
            )}
          </div>
        </div>

        {/* Back to Login */}
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
