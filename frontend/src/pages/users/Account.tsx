import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { showSwalAlert } from '../../utils/SwalAlert';
import useAuthStore from '../../store/authStore';
import { isAxiosError } from 'axios';
import PasswordChangeForm from '../../components/user/PasswordChangeForm';
import PageWrapper from '../../components/PageWrapper';

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
      showSwalAlert('แก้ไขชื่อผู้ใช้งานสำเร็จ', 'success');
    } catch (error) {
      console.error(error);
      showSwalAlert('เกิดข้อผิดพลาดในการแก้ไขชื่อ', 'error');
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('รหัสผ่านไม่ตรงกัน');
      return;
    }
    try {
      setPasswordError('');
      const response = await axios.put(
        '/change-password',
        { oldPassword, password: newPassword, confirmPassword },
        { withCredentials: true },
      );
      showSwalAlert(response.data?.message || 'เปลี่ยนรหัสผ่านสำเร็จ', 'success');
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
      showSwalAlert(msg, 'error');
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
          {!isChangingPassword && (
            <div className="fixed left-0 bottom-8 w-full flex justify-center">
              <button className="text-[#FF5F57] font-medium">ลบบัญชี</button>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default Account;
