import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import useAuthStore from '../../store/authStore';
import { isAxiosError } from 'axios';
import PasswordChangeForm from '../../components/user/account/PasswordChangeForm';
import PageWrapper from '../../components/PageWrapper';
import { showToastAlert } from '../../store/toastStore';
import Modal from '../../components/Modal';

const Account: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const actionSetUser = useAuthStore((state) => state.actionSetUser);
  const [name, setName] = useState<string>('');
  const [isEdited, setIsEdited] = useState<boolean>(false);
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState<string>('');
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
    } catch (error) {
      console.log(error);
      showToastAlert('เกิดข้อผิดพลาดในการแก้ไขชื่อ', 'error');
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
        msg = error.response?.data?.message || msg;
      }
      setPasswordError(msg);
      showToastAlert(msg, 'error');
    }
  };

  const handleDeleteUser = async () => {
    if (deleteEmail !== user.email) {
      setDeleteError('Email ไม่ตรงกับบัญชีผู้ใช้');
      return;
    }
    try {
      await axios.delete(`/user/${user.id}`, {
        data: { confirm: deleteEmail },
      });
      showToastAlert('ลบบัญชีเรียบร้อย', 'success');
      window.location.href = '/'; // redirect หลังลบ
    } catch (error: unknown) {
      let msg = 'เกิดข้อผิดพลาด';
      if (isAxiosError(error)) msg = error.response?.data?.message || msg;
      showToastAlert(msg, 'error');
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteEmail('');
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
          <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl p-10 w-full max-w-md border border-gray-100">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl opacity-30 -z-10"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gray-100 rounded-full blur-2xl opacity-40 -z-10"></div>
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center border border-red-200 shadow-lg">
                  <svg
                    className="w-10 h-10 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
              ยืนยันการลบบัญชี
            </h2>
            <p className="text-center text-gray-500 mb-8 text-sm font-medium tracking-wide">
              การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </p>
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                กรุณากรอก email ของคุณเพื่อยืนยัน
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={deleteEmail}
                  onChange={(e) => setDeleteEmail(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-5 py-4 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none shadow-sm hover:border-gray-300 font-medium text-gray-900 placeholder:text-gray-400"
                  placeholder="example@email.com"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/5 to-transparent pointer-events-none"></div>
              </div>
              {deleteError && (
                <div className="flex items-center gap-2 mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-red-700 text-sm font-semibold">{deleteError}</p>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-6 py-4 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 active:scale-95 transition-all duration-200 shadow-sm"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDeleteUser}
                className="relative flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:from-red-700 hover:to-red-800 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl overflow-hidden group"
              >
                <span className="relative z-10">ลบบัญชี</span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </PageWrapper>
  );
};

export default Account;
