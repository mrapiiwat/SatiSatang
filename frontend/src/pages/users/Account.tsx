import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import useAuthStore from '../../store/authStore';
import { isAxiosError, AxiosError } from 'axios';
import PasswordChangeForm from '../../components/user/account/PasswordChangeForm';
import PageWrapper from '../../components/PageWrapper';
import { showToastAlert } from '../../store/toastStore';
import type { ElysiaResponse } from '../../interface/error';
import BackButton from '../../components/BackButton';
import { useTranslation } from 'react-i18next';

const Account: React.FC = () => {
  const { t } = useTranslation();
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

  const isSSO = user.currentLogin !== 'local';

  const loginMethod =
    user.currentLogin === 'local'
      ? 'local'
      : user.currentLogin
        ? user.currentLogin.charAt(0).toUpperCase() + user.currentLogin.slice(1)
        : 'local';

  const handleError = (
    error: unknown,
    defaultMessage: string = t('error_default', 'เกิดข้อผิดพลาด'),
  ) => {
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
      showToastAlert(t('edit_name_success', 'แก้ไขชื่อผู้ใช้งานสำเร็จ'), 'success');
    } catch (error: unknown) {
      handleError(error, t('edit_name_error', 'เกิดข้อผิดพลาดในการแก้ไขชื่อ'));
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      showToastAlert(t('password_mismatch', 'รหัสผ่านไม่ตรงกัน'), 'error');
      setPasswordError(t('password_mismatch', 'รหัสผ่านไม่ตรงกัน'));
      return;
    }
    try {
      setPasswordError('');
      const response = await axios.put('/change-password', {
        oldPassword,
        password: newPassword,
        confirmPassword,
      });
      showToastAlert(
        response.data?.message || t('change_password_success', 'เปลี่ยนรหัสผ่านสำเร็จ'),
        'success',
      );

      setIsChangingPassword(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: unknown) {
      const msg = handleError(error, t('change_password_error', 'เกิดข้อผิดพลาด โปรดลองใหม่'));
      setPasswordError(msg);
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
      <BackButton />
      <div className="relative px-6 py-8 font-ibm text-black-900 dark:text-white">
        <h1 className="text-center font-semibold mb-8">{t('account_label', 'บัญชีผู้ใช้')}</h1>

        <div className="mb-6 max-w-md mx-auto">
          <label className="block text-sm font-semibold mb-1">
            {t('username_label', 'ชื่อผู้ใช้งาน')}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setIsEdited(true);
            }}
            className={`w-full border-b focus:outline-none pb-1 bg-transparent dark:text-white ${isEdited ? 'border-blue-600' : 'border-black-400 dark:border-black-500'}`}
            placeholder={t('username_placeholder', 'กรอกชื่อผู้ใช้งาน')}
          />
        </div>

        {!isSSO && (
          <div className="mb-8 max-w-md mx-auto">
            <label className="block text-sm font-semibold mb-1">
              {t('password_label', 'รหัสผ่าน')}
            </label>
            <button
              onClick={() => setIsChangingPassword(true)}
              className="w-full border-b border-black-400 dark:border-black-500 text-black-900 dark:text-white text-left pb-1 bg-transparent"
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
            {t('save_btn', 'บันทึก')}
          </button>
        </div>

        {!isChangingPassword && (
          <div className="fixed left-0 bottom-8 w-full flex justify-center">
            {loginMethod === 'local' ? null : (
              <span className="text-gray-500 font-medium text-sm">
                {t('login_with', {
                  method: loginMethod,
                  defaultValue: `เข้าสู่ระบบด้วย: ${loginMethod}`,
                })}
              </span>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Account;
