import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import axios from '../../api/axios';
import { AxiosError } from 'axios';
import { showToastAlert } from '../../store/toastStore';

const Recovery: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('userEmail');
    if (!storedEmail) {
      navigate('/');
    } else {
      setEmail(storedEmail);
    }
  }, [navigate]);

  const handleResendEmail = async () => {
    if (!email) return;

    setLoading(true);
    try {
      await axios.post(`/forgot-password`, { email });
      showToastAlert('ส่งอีเมลเรียบร้อยแล้ว', 'success');
      setSent(true);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const axiosError = error as AxiosError<{ message?: string }>;
        showToastAlert(axiosError.response?.data?.message || 'เกิดข้อผิดพลาด', 'error');
      } else {
        showToastAlert('เกิดข้อผิดพลาด ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 'error');
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
    <div className="font-ibm text-gray-900 relative min-h-screen bg-white">
      <div className="w-full flex justify-center pt-6">
        <Logo />
      </div>

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 w-full max-w-md">
        <div className="bg-white p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">เช็กอีเมลของคุณ</h1>
          <p className="text-gray-600 mb-6">
            เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว <br />
            โปรดตรวจสอบกล่องขาเข้า (Inbox) หรือ โฟลเดอร์ Spam
          </p>
          <button
            onClick={handleBackToLogin}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition mb-4 w-full"
          >
            กลับไปหน้าเข้าสู่ระบบ
          </button>
          {!sent ? (
            <>
              <p className="text-sm text-gray-500 mb-2 mt-4">
                หากไม่ได้รับอีเมล คุณสามารถส่งใหม่ได้
              </p>
              <button
                onClick={handleResendEmail}
                disabled={loading}
                className={`text-blue-600 underline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'กำลังส่ง...' : 'ส่งอีเมลอีกครั้ง'}
              </button>
            </>
          ) : (
            <p className="text-gray-500 font-medium mt-4">ส่งอีเมลเรียบร้อยแล้ว</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recovery;
