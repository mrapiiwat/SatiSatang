import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { IoLockClosedOutline } from 'react-icons/io5';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { showToastAlert } from '../../store/toastStore';
import Logo from '../../components/Logo';
import { IoCheckmarkCircle } from 'react-icons/io5';


const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenFromUrl = searchParams.get('token') || '';
  const uidFromUrl = searchParams.get('uid') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const validatePassword = (password: string) => {
    if (password.length < 6) return ['รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'];
    else if (!/[A-Z]/.test(password)) return ['ต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว (A-Z)'];
    else if (!/[a-z]/.test(password)) return ['ต้องมีตัวอักษรพิมพ์เล็กอย่างน้อย 1 ตัว (a-z)'];
    else if (!/[0-9]/.test(password)) return ['ต้องมีตัวเลขอย่างน้อย 1 ตัว (0-9)'];
    return [];
  };

  useEffect(() => {
    const verifyLink = async () => {
      try {
        if (!tokenFromUrl || !uidFromUrl) {
          navigate('/');
          return;
        }
        const res = await axios.get('/reset-password/verify', {
          params: { token: tokenFromUrl, uid: uidFromUrl },
        });

        if (!res.data.valid) {
          navigate('/');
        } else {
          window.history.replaceState({}, '', '/reset-password');
        }
      } catch {
        navigate('/');
      }
    };

    verifyLink();
  }, [tokenFromUrl, uidFromUrl, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      showToastAlert(passwordErrors.join(', '), 'error');
      return;
    }

    if (!newPassword || !confirm) {
      showToastAlert('กรุณากรอกรหัสผ่านให้ครบถ้วน', 'error');
      return;
    }
    if (newPassword !== confirm) {
      showToastAlert('รหัสผ่านไม่ตรงกัน', 'error');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/reset-password', {
        token: tokenFromUrl,
        uid: Number(uidFromUrl),
        newPassword,
      });

      showToastAlert('รีเซ็ตรหัสผ่านสำเร็จ', 'success');
      setIsReset(true);
    } catch (err: unknown) {
      let message = 'เกิดข้อผิดพลาด';
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as AxiosError<{ message?: string }>;
        message = axiosErr.response?.data?.message ?? message;
      }
      showToastAlert(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center font-ibm text-gray-900 px-4">
      <div className="absolute top-6 w-full flex justify-center">
        <Logo />
      </div>
      {isReset ? (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-8 w-full max-w-md text-center">
            <div className="mb-8">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <IoCheckmarkCircle className="text-green-600 w-8 h-8" strokeWidth={2} />
              </div>

              <h1 className="text-3xl font-semibold text-gray-900 mb-4">
                เปลี่ยนรหัสผ่านสำเร็จ
              </h1>

              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                รหัสผ่านของคุณได้รับการเปลี่ยนแปลงเรียบร้อยแล้ว
              </p>

              <p className="text-gray-500 text-sm">
                คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที
              </p>
            </div>
          </div>
        </div>

      ) : (
        <div className="bg-white rounded-2xl p-8 w-full max-w-md text-center animate-fadeIn">
          <IoLockClosedOutline className="text-blue-600 text-6xl mb-4 mx-auto" />
          <h1 className="text-2xl font-bold mb-4">ตั้งรหัสผ่านใหม่</h1>
          <p className="text-gray-600 mb-6">
            โปรดกรอกรหัสผ่านใหม่ของคุณ และยืนยันอีกครั้งเพื่อความถูกต้อง
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
            <div>
              <label className="block text-sm font-medium mb-1">รหัสผ่านใหม่</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">ยืนยันรหัสผ่าน</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`mt-3 w-full flex justify-center items-center gap-2 py-2 rounded-lg font-semibold text-white transition ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              {loading && <AiOutlineLoading3Quarters className="animate-spin" />}
              {loading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
            </button>
          </form>
        </div>
      )}

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

export default ResetPassword;
