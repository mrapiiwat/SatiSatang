import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import useAuthStore from '../../store/authStore';
import { isAxiosError, AxiosError } from 'axios';
import PasswordChangeForm from '../../components/user/account/PasswordChangeForm';
import PageWrapper from '../../components/PageWrapper';
import { showToastAlert } from '../../store/toastStore';
import Modal from '../../components/Modal';
import { useNavigate } from 'react-router-dom';
import type { ElysiaResponse } from '../../interface/error';

const Account: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const actionSetUser = useAuthStore((state) => state.actionSetUser);
  const actionClearAuth = useAuthStore((state) => state.actionClearAuth);
  const [name, setName] = useState<string>('');
  const [isEdited, setIsEdited] = useState<boolean>(false);
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState<string>(''); // กลับมาใช้ชื่อเดิม
  const [deleteStep, setDeleteStep] = useState<number>(1); // อันนี้เก็บไว้ (สำคัญสำหรับ Popup 2 หน้า)
  const [deleteError, setDeleteError] = useState<string>('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('/me');
        actionSetUser(response.data);
        setName(response.data.name || '');
      } catch (error) {
        console.error('Fetch user error:', error);
      }
    };

    if (!user) fetchUser();
    else setName(user.name || '');
  }, [user, actionSetUser]);

  if (!user) return <div>Loading...</div>;

  const isSSO = user.oauthAccounts && user.oauthAccounts.length > 0;

  const handleSaveName = async () => {
    if (!name.trim()) return;
    try {
      const response = await axios.put('/update-name', { name });
      actionSetUser({ ...user, name: response.data.name });
      setIsEdited(false);
      showToastAlert('แก้ไขชื่อผู้ใช้งานสำเร็จ', 'success');
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        const axiosError = error as AxiosError<ElysiaResponse>;
        const data = axiosError.response?.data;

        const customError = Array.isArray(data?.errors)
          ? data?.errors.find((e: { schema?: { error?: string } }) => e.schema?.error)?.schema
              ?.error
          : null;

        const msg =
          customError ||
          (Array.isArray(data?.errors) ? data?.errors?.[0]?.summary : null) ||
          data?.message ||
          'เกิดข้อผิดพลาดในการแก้ไขชื่อ';

        showToastAlert(msg, 'error');
      } else if (error instanceof Error) {
        showToastAlert(error.message, 'error');
      } else {
        showToastAlert('เกิดข้อผิดพลาดไม่ทราบสาเหตุ', 'error');
      }
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('รหัสผ่านไม่ตรงกัน');
      return;
    }
    try {
      setPasswordError('');
      const response = await axios.put('/change-password', {
        oldPassword,
        password: newPassword,
        confirmPassword,
      });
      showToastAlert(response.data?.message || 'เปลี่ยนรหัสผ่านสำเร็จ', 'success');
      setIsChangingPassword(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: unknown) {
      let msg = 'เกิดข้อผิดพลาด โปรดลองใหม่';

      if (isAxiosError(error)) {
        const axiosError = error as AxiosError<ElysiaResponse>;
        const data = axiosError.response?.data;

        const customError = data?.errors?.find((e) => e.schema?.error)?.schema?.error;

        msg = customError || data?.errors?.[0]?.summary || data?.message || msg;
      }

      setPasswordError(msg);
      showToastAlert(msg, 'error');
    }
  };

  const handleDeleteUser = async () => {
    // เช็คว่า Email ที่กรอก ตรงกับ Email ของ user จริงๆ หรือไม่
    if (deleteEmail !== user.email) {
      setDeleteError('Email ไม่ตรงกับบัญชีผู้ใช้');
      return;
    }
    try {
      await axios.delete(`/delete-account/${user.id}`, {
        data: { confirm: deleteEmail }, // ส่ง Email ไปยืนยันเหมือนเดิม
      });

      actionClearAuth();
      showToastAlert('ลบบัญชีเรียบร้อย', 'success');
      navigate('/');
    } catch (error: unknown) {
      // ... (ส่วนจัดการ Error เหมือนเดิมเป๊ะ ไม่ต้องแก้) ...
      let msg = 'เกิดข้อผิดพลาด';
      if (isAxiosError(error)) {
        const axiosError = error as AxiosError<ElysiaResponse>;
        const data = axiosError.response?.data;
        const customError = data?.errors?.find((e) => e.schema?.error)?.schema?.error;
        msg = customError || data?.errors?.[0]?.summary || data?.message || msg;
      }
      showToastAlert(msg, 'error');
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteEmail(''); // เคลียร์ช่องกรอก
      setDeleteStep(1); // รีเซ็ตให้กลับไปหน้าแรก (หน้าถาม ใช่/ไม่) เสมอ
      setDeleteError('');
    }
  };

  if (isChangingPassword && !isSSO) {
    return (
      <PasswordChangeForm
        oldPassword={oldPassword}
        setOldPassword={setOldPassword}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        passwordError={passwordError}
        handlePasswordChange={handlePasswordChange}
        cancel={() => setIsChangingPassword(false)}
      />
    );
  }

  return (
    <PageWrapper animation="fade">
      <div className="relative px-6 py-8 font-ibm text-black-900 min-h-screen">
        <h1 className="text-center font-semibold mb-8">บัญชีผู้ใช้</h1>

        <div className="mb-6 max-w-md mx-auto">
          <label className="block text-sm font-semibold mb-1">ชื่อผู้ใช้งาน</label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setIsEdited(true);
            }}
            className={`w-full border-b focus:outline-none pb-1 ${isEdited ? 'border-blue-600' : 'border-black-400'}`}
            placeholder="กรอกชื่อผู้ใช้งาน"
          />
        </div>

        {!isSSO && (
          <div className="mb-8 max-w-md mx-auto">
            <label className="block text-sm font-semibold mb-1">รหัสผ่าน</label>
            <button
              onClick={() => setIsChangingPassword(true)}
              className="w-full border-b border-black-400 text-black-900 text-left pb-1"
            >
              *************
            </button>
          </div>
        )}

        <div className="flex justify-end mb-6 max-w-md mx-auto">
          <button
            disabled={!isEdited || !name.trim()}
            onClick={handleSaveName}
            className={`px-6 py-2 rounded-md text-white text-sm font-semibold ${isEdited && name.trim() ? 'bg-blue-600' : 'bg-gray-400 cursor-not-allowed'}`}
          >
            บันทึก
          </button>
        </div>

        {!isChangingPassword && (
          <div className="fixed left-0 bottom-8 w-full flex justify-center">
            <button
              className="text-[#FF5F57] font-medium"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              ลบบัญชี
            </button>
          </div>
        )}

        <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
          {/* Wrapper หลัก: จัดกึ่งกลางและกำหนดขนาด */}
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-auto shadow-xl relative overflow-hidden">
            {/* --- ส่วนที่ 1: หน้าถามยืนยัน (แสดงเมื่อ deleteStep === 1) --- */}
            {deleteStep === 1 && (
              <div className="flex flex-col items-center text-center animate-fade-in">
                {/* ไอคอนถังขยะ */}
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-10 h-10 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">ต้องการลบบัญชีใช่หรือไม่?</h3>
                <p className="text-gray-500 text-sm mb-6">การดำเนินการนี้จะไม่สามารถกู้คืนได้</p>

                {/* ปุ่มกด */}
                <div className="flex flex-col w-full gap-3">
                  <button
                    onClick={() => setDeleteStep(2)} // กดแล้วไป Step 2
                    className="w-full bg-[#FF5F57] hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-colors shadow-md shadow-red-200"
                  >
                    ใช่ ลบเลย
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(false)} // กดแล้วปิด
                    className="w-full text-gray-500 font-medium py-2 hover:text-gray-700 underline decoration-gray-300 decoration-1 underline-offset-4"
                  >
                    ยังไม่ลบตอนนี้
                  </button>
                </div>
              </div>
            )}

            {/* --- ส่วนที่ 2: หน้ากรอก Email (แสดงเมื่อ deleteStep === 2) --- */}
            {deleteStep === 2 && (
              <div className="flex flex-col animate-fade-in">
                <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
                  ยืนยันการลบบัญชี
                </h3>

                <label className="text-sm font-semibold text-gray-700 mb-2">
                  กรุณากรอก Email ของคุณเพื่อยืนยัน
                </label>

                <input
                  type="email"
                  value={deleteEmail}
                  onChange={(e) => setDeleteEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  placeholder={user?.email || 'example@email.com'}
                />

                {/* แสดง Error ถ้ามี */}
                {deleteError && (
                  <p className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded border border-red-100 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {deleteError}
                  </p>
                )}

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setDeleteStep(1)} // ย้อนกลับไป Step 1
                    className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    ย้อนกลับ
                  </button>
                  <button
                    onClick={handleDeleteUser} // ลบจริง!
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-lg shadow-red-200 transition-all active:scale-95"
                  >
                    ตกลง
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </PageWrapper>
  );
};

export default Account;
