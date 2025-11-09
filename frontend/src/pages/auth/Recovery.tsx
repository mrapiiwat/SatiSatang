import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import axios from '../../api/axios';
import { AxiosError } from 'axios';
import { showToastAlert } from '../../store/toastStore';
import { IoMailOutline } from 'react-icons/io5';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

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
    <div className="min-h-screen flex flex-col items-center justify-center font-ibm text-gray-900 bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="absolute top-6 w-full flex justify-center">
        <Logo />
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 w-full max-w-md text-center animate-fadeIn">
        <IoMailOutline className="text-blue-600 text-6xl mb-4 mx-auto animate-fadeIn" />
        <h1 className="text-2xl font-bold mb-4">เช็กอีเมลของคุณ</h1>
        <p className="text-gray-600 mb-6">
          เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว <br />
          โปรดตรวจสอบกล่องขาเข้า (Inbox) หรือ โฟลเดอร์ Spam
        </p>

        <button
          onClick={handleBackToLogin}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition w-full mb-4"
        >
          กลับไปหน้าเข้าสู่ระบบ
        </button>

        {!sent ? (
          <>
            <p className="text-sm text-gray-500 mb-2 mt-4">หากไม่ได้รับอีเมล คุณสามารถส่งใหม่ได้</p>
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
                  กำลังส่ง...
                </>
              ) : (
                'ส่งอีเมลอีกครั้ง'
              )}
            </button>
          </>
        ) : (
          <p className="text-gray-500 font-medium mt-4">ส่งอีเมลเรียบร้อยแล้ว</p>
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
