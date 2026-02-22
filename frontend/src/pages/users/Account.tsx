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
import BackButton from '../../components/BackButton';

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
  const [deleteEmail, setDeleteEmail] = useState<string>('');
  const [deleteStep, setDeleteStep] = useState<number>(1);

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

  const handleError = (error: unknown, defaultMessage: string = 'เกิดข้อผิดพลาด') => {
    let msg = defaultMessage;

    if (isAxiosError(error)) {
      const axiosError = error as AxiosError<ElysiaResponse>;
      const data = axiosError.response?.data;

      const customError = Array.isArray(data?.errors)
        ? data?.errors.find((e: { schema?: { error?: string } }) => e.schema?.error)?.schema?.error
        : null;

      msg =
        customError ||
        (Array.isArray(data?.errors) ? data?.errors?.[0]?.summary : null) ||
        data?.message ||
        msg;
    } else if (error instanceof Error) {
      msg = error.message;
    }

    showToastAlert(msg, 'error');
    return msg;
  };

  const handleSaveName = async () => {
    if (!name.trim()) return;
    try {
      const response = await axios.put('/update-name', { name });
      actionSetUser({ ...user, name: response.data.name });
      setIsEdited(false);
      showToastAlert('แก้ไขชื่อผู้ใช้งานสำเร็จ', 'success');
    } catch (error: unknown) {
      handleError(error, 'เกิดข้อผิดพลาดในการแก้ไขชื่อ');
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      showToastAlert('รหัสผ่านไม่ตรงกัน', 'error');
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
      const msg = handleError(error, 'เกิดข้อผิดพลาด โปรดลองใหม่');
      setPasswordError(msg);
    }
  };

  const handleDeleteUser = async () => {
    if (deleteEmail !== user.email) {
      showToastAlert('Email ไม่ตรงกับบัญชีผู้ใช้', 'error');
      return;
    }

    try {
      await axios.delete(`/delete-account/${user.id}`, {
        data: { confirm: deleteEmail },
      });

      actionClearAuth();
      showToastAlert('ลบบัญชีเรียบร้อย', 'success');
      navigate('/');
    } catch (error: unknown) {
      handleError(error, 'เกิดข้อผิดพลาดในการลบบัญชี');
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteStep(1);
    setDeleteEmail('');
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
      <BackButton />
      <div className="relative px-6 py-8 font-ibm text-black-900">
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

        <Modal isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal}>
          <div className="bg-white rounded-2xl p-6 w-[90vw] max-w-[360px] mx-auto shadow-xl transform transition-all">
            {deleteStep === 1 && (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>

                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">ลบบัญชีผู้ใช้?</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    การดำเนินการนี้ไม่สามารถกู้คืนได้ <br /> ข้อมูลทั้งหมดจะหายไปถาวร
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full">
                  <button
                    onClick={handleCloseDeleteModal}
                    className="py-2.5 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={() => setDeleteStep(2)}
                    className="py-2.5 px-4 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
                  >
                    ลบเลย
                  </button>
                </div>
              </div>
            )}

            {deleteStep === 2 && (
              <div className="flex flex-col">
                <div className="text-center mb-5">
                  <h3 className="text-lg font-semibold text-gray-900">ยืนยันครั้งสุดท้าย</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    พิมพ์ <span className="font-medium text-gray-900">{user?.email}</span>{' '}
                    เพื่อยืนยัน
                  </p>
                </div>

                <div className="mb-6 relative">
                  <input
                    type="email"
                    value={deleteEmail}
                    onChange={(e) => setDeleteEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 block p-3 outline-none transition-all text-center"
                    placeholder={user?.email}
                  />
                  {/* ลบส่วนแสดง Error text ตรงนี้ออกแล้ว */}
                </div>

                <div className="grid grid-cols-2 gap-3 w-full">
                  <button
                    onClick={() => setDeleteStep(1)}
                    className="py-2.5 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    ย้อนกลับ
                  </button>
                  <button
                    onClick={handleDeleteUser}
                    disabled={!deleteEmail}
                    className={`py-2.5 px-4 rounded-xl text-sm font-medium transition-colors shadow-sm
              ${
                !deleteEmail
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-100'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
                  >
                    ยืนยันลบ
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
