import React from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton';
import PageWrapper from '../../components/PageWrapper';
import useAuthStore from '../../store/authStore';
import useSettingStore from '../../store/settingStore';
import { showToastAlert } from '../../store/toastStore';
import axios from '../../api/axios';
import {
  IoPersonOutline,
  IoGridOutline,
  IoChatbubblesOutline,
  IoShieldCheckmarkOutline,
  IoLogOutOutline,
  IoChevronForwardOutline,
  IoLanguageOutline,
  IoSparklesOutline,
  IoContrastOutline,
  IoNotificationsOutline,
  IoCalendarOutline,
} from 'react-icons/io5';

interface SettingRow {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick: () => void;
  danger?: boolean;
}

const LANGUAGE_OPTIONS = [
  { value: 'th', label: 'ภาษาไทย' },
  { value: 'en', label: 'English' },
] as const;

const THEME_OPTIONS = [
  { value: 'system', label: 'ตามระบบ' },
  { value: 'light', label: 'สว่าง' },
  { value: 'dark', label: 'มืด' },
] as const;

const Setting: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const actionLogout = useAuthStore((state) => state.actionLogout);

  const appLanguage = useSettingStore((s) => s.appLanguage);
  const aiLanguage = useSettingStore((s) => s.aiLanguage);
  const theme = useSettingStore((s) => s.theme);
  const isNotificationEnabled = useSettingStore((s) => s.isNotificationEnabled);
  const budgetStartDate = useSettingStore((s) => s.budgetStartDate);
  const actionUpdateSetting = useSettingStore((s) => s.actionUpdateSetting);

  const handleLogout = async () => {
    actionLogout();
    navigate('/login');
    showToastAlert('ออกจากระบบแล้ว', 'success');
  };

  const accountRows: SettingRow[] = [
    {
      icon: <IoPersonOutline size={20} />,
      label: 'บัญชีผู้ใช้',
      description: user?.name || user?.email || '',
      onClick: () => navigate('/user/account'),
    },
    {
      icon: <IoGridOutline size={20} />,
      label: 'หมวดหมู่',
      description: 'จัดการหมวดหมู่รายรับ-รายจ่าย',
      onClick: () => navigate('/user/categories'),
    },
  ];

  const supportRows: SettingRow[] = [
    {
      icon: <IoChatbubblesOutline size={20} />,
      label: 'ส่งความคิดเห็น',
      description: 'ช่วยเราพัฒนาแอปให้ดียิ่งขึ้น',
      onClick: () => navigate('/user/feedback'),
    },
    {
      icon: <IoShieldCheckmarkOutline size={20} />,
      label: 'นโยบายความเป็นส่วนตัว',
      description: 'รายละเอียดการปกป้องข้อมูลของคุณ',
      onClick: () => navigate('/policies/privacy-policy'),
    },
  ];

  const renderRow = (row: SettingRow, index: number, arr: SettingRow[]) => (
    <button
      key={row.label}
      onClick={row.onClick}
      className={`w-full flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-gray-50 active:bg-gray-100 ${row.danger ? 'text-red-500' : 'text-black-900'
        } ${index < arr.length - 1 ? 'border-b border-gray-100' : ''}`}
    >
      <span className={`shrink-0 ${row.danger ? 'text-red-500' : 'text-black-700'}`}>
        {row.icon}
      </span>
      <div className="flex flex-col items-start flex-1 min-w-0 text-left">
        <span className="text-sm font-medium">{row.label}</span>
        {row.description && (
          <span className="text-xs text-gray-400 truncate w-full">{row.description}</span>
        )}
      </div>
      {!row.danger && <IoChevronForwardOutline size={16} className="text-gray-300 shrink-0" />}
    </button>
  );

  return (
    <PageWrapper animation="fade">
      <BackButton />
      <div className="px-6 py-4 font-ibm text-black-900 max-w-md mx-auto">
        <h1 className="text-center font-semibold mb-8">ตั้งค่า</h1>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">
          บัญชี
        </p>
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-6">
          {accountRows.map((row, i, arr) => renderRow(row, i, arr))}
        </div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">
          การตั้งค่าแอป
        </p>
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="flex items-center gap-4 px-4 py-3.5 border-b border-gray-100">
            <span className="shrink-0 text-black-700">
              <IoLanguageOutline size={20} />
            </span>
            <span className="text-sm font-medium flex-1">ภาษาแอป</span>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
              {LANGUAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => actionUpdateSetting({ appLanguage: opt.value })}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${appLanguage === opt.value
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4 px-4 py-3.5 border-b border-gray-100">
            <span className="shrink-0 text-black-700">
              <IoSparklesOutline size={20} />
            </span>
            <span className="text-sm font-medium flex-1">ภาษา AI</span>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
              {LANGUAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => actionUpdateSetting({ aiLanguage: opt.value })}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${aiLanguage === opt.value
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4 px-4 py-3.5 border-b border-gray-100">
            <span className="shrink-0 text-black-700">
              <IoContrastOutline size={20} />
            </span>
            <span className="text-sm font-medium flex-1">ธีม</span>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
              {THEME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => actionUpdateSetting({ theme: opt.value })}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${theme === opt.value
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 px-4 py-3.5 border-b border-gray-100">
            <span className="shrink-0 text-black-700">
              <IoNotificationsOutline size={20} />
            </span>
            <span className="text-sm font-medium flex-1">การแจ้งเตือน</span>
            <button
              onClick={() => actionUpdateSetting({ isNotificationEnabled: !isNotificationEnabled })}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${isNotificationEnabled ? 'bg-blue-600' : 'bg-gray-300'
                }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${isNotificationEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
              />
            </button>
          </div>

          <div className="flex items-center gap-4 px-4 py-3.5">
            <span className="shrink-0 text-black-700">
              <IoCalendarOutline size={20} />
            </span>
            <div className="flex flex-col flex-1">
              <span className="text-sm font-medium">วันเริ่มต้นรอบงบประมาณ</span>
              <span className="text-xs text-gray-400">
                ทุกเดือนจะรีเซ็ตในวันที่ {budgetStartDate}
              </span>
            </div>
            <select
              value={budgetStartDate}
              onChange={(e) => actionUpdateSetting({ budgetStartDate: Number(e.target.value) })}
              className="text-sm text-black-900 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  วันที่ {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">
          การสนับสนุน
        </p>
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-6">
          {supportRows.map((row, i, arr) => renderRow(row, i, arr))}
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-10">
          {renderRow(
            {
              icon: <IoLogOutOutline size={20} />,
              label: 'ออกจากระบบ',
              onClick: handleLogout,
              danger: true,
            },
            0,
            [{ icon: null, label: '', onClick: () => { } }],
          )}
        </div>

        <p className="text-center text-xs text-gray-300">สติสตางค์ · v1.0.0</p>
      </div>
    </PageWrapper>
  );
};

export default Setting;
