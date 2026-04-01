import React, { useState } from 'react';
import { LuEye, LuEyeClosed } from 'react-icons/lu';
import type { PasswordChangeFormProps } from '../../../interface/account';
import { useTranslation } from 'react-i18next';

const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({
  oldPassword,
  setOldPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  passwordError,
  handlePasswordChange,
  cancel,
}) => {
  const { t } = useTranslation();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="relative px-6 py-8 font-ibm text-black-900 min-h-screen">
      <h2 className="text-center font-semibold mb-6">
        {t('change_password_title', 'เปลี่ยนรหัสผ่าน')}
      </h2>
      <div className="space-y-6 max-w-md mx-auto">
        <div>
          <label className="block text-sm mb-1">{t('old_password_label', 'รหัสผ่านเก่า')}</label>
          <div className="flex items-center border-b border-gray-300">
            <input
              type={showOldPassword ? 'text' : 'password'}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="flex-1 focus:outline-none py-1"
            />
            <button onClick={() => setShowOldPassword(!showOldPassword)} className="text-gray-600">
              {showOldPassword ? <LuEye /> : <LuEyeClosed />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">{t('new_password_label', 'รหัสผ่านใหม่')}</label>
          <div className="flex items-center border-b border-gray-300">
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="flex-1 focus:outline-none py-1"
            />
            <button onClick={() => setShowNewPassword(!showNewPassword)} className="text-gray-600">
              {showNewPassword ? <LuEye /> : <LuEyeClosed />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">
            {t('confirm_password_label', 'ยืนยันรหัสผ่าน')}
          </label>
          <div className="flex items-center border-b border-gray-300">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="flex-1 focus:outline-none py-1"
            />
            <button
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-gray-600"
            >
              {showConfirmPassword ? <LuEye /> : <LuEyeClosed />}
            </button>
          </div>
          {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
        </div>

        <div className="flex justify-between mt-6">
          <button onClick={cancel} className="text-black-600 font-medium">
            {t('back_btn', 'กลับ')}
          </button>
          <button
            onClick={handlePasswordChange}
            className="px-6 py-2 rounded-md bg-blue-600 text-white font-semibold"
          >
            {t('save_btn', 'บันทึก')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordChangeForm;
