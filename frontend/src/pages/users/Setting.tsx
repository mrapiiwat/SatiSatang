import React from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton';
import PageWrapper from '../../components/PageWrapper';
import useAuthStore from '../../store/authStore';
import useSettingStore from '../../store/settingStore';
import { showToastAlert } from '../../store/toastStore';
import { useTranslation } from 'react-i18next';
import { requestForToken } from '../../config/firebase';
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
import axios from '../../api/axios';
import useLoadingStore from '../../store/loadingStore';
import type { SettingRow } from '../../interface/setting';

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
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const actionLogout = useAuthStore((state) => state.actionLogout);

  const appLanguage = useSettingStore((state) => state.appLanguage);
  const aiLanguage = useSettingStore((state) => state.aiLanguage);
  const theme = useSettingStore((state) => state.theme);
  const isNotificationEnabled = useSettingStore((state) => state.isNotificationEnabled);
  const budgetStartDate = useSettingStore((state) => state.budgetStartDate);
  const actionUpdateSetting = useSettingStore((state) => state.actionUpdateSetting);
  const actionClearSettings = useSettingStore((state) => state.actionClearSettings);
  const startLoading = useLoadingStore((state) => state.startLoading);
  const stopLoading = useLoadingStore((state) => state.stopLoading);

  const handleLogout = async () => {
    actionClearSettings();
    actionLogout();
    navigate('/login');
    showToastAlert(t('logout_success', 'ออกจากระบบแล้ว'), 'success');
  };

  const handleToggleNotification = async () => {
    const isTurningOn = !isNotificationEnabled;

    if (isTurningOn) {
      if (!('Notification' in window)) {
        showToastAlert(t('noti_not_supported', 'เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือน'), 'error');
        return;
      }

      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        try {
          const token = await requestForToken();
          if (token) {
            await actionUpdateSetting({ isNotificationEnabled: true });
            useSettingStore.getState().actionSyncFCMToken();
            showToastAlert(t('noti_enable_success', 'เปิดรับการแจ้งเตือนสำเร็จ'), 'success');
          }
        } catch (error) {
          console.error(error);
          showToastAlert(t('server_error', 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์'), 'error');
        }
      } else {
        showToastAlert(
          t('noti_permission_denied', 'กรุณาอนุญาตการแจ้งเตือนในเบราว์เซอร์'),
          'error',
        );
      }
    } else {
      try {
        const token = await requestForToken();
        if (token) {
          await axios.delete('/notification/token', { data: { token } });
        }

        actionUpdateSetting({
          isNotificationEnabled: false,
          lastSyncedToken: null,
        });
        showToastAlert(t('noti_disable_success', 'ปิดรับการแจ้งเตือนแล้ว'), 'success');
      } catch {
        actionUpdateSetting({ isNotificationEnabled: false });
      }
    }
  };

  const accountRows: SettingRow[] = [
    {
      icon: <IoPersonOutline size={20} />,
      label: t('account_label', 'บัญชีผู้ใช้'),
      description: user?.name || user?.email || '',
      onClick: () => navigate('/user/account'),
    },
    {
      icon: <IoGridOutline size={20} />,
      label: t('category_label', 'หมวดหมู่'),
      description: t('category_desc', 'จัดการหมวดหมู่รายรับ-รายจ่าย'),
      onClick: () => navigate('/user/categories'),
    },
  ];

  const supportRows: SettingRow[] = [
    {
      icon: <IoChatbubblesOutline size={20} />,
      label: t('feedback_label', 'ส่งความคิดเห็น'),
      description: t('feedback_desc', 'ช่วยเราพัฒนาแอปให้ดียิ่งขึ้น'),
      onClick: () => navigate('/user/feedback'),
    },
    {
      icon: <IoShieldCheckmarkOutline size={20} />,
      label: t('privacy_label', 'นโยบายความเป็นส่วนตัว'),
      description: t('privacy_desc', 'รายละเอียดการปกป้องข้อมูลของคุณ'),
      onClick: () => navigate('/policies/privacy-policy'),
    },
  ];

  const renderRow = (row: SettingRow, index: number, arr: SettingRow[]) => (
    <button
      key={row.label}
      onClick={row.onClick}
      className={`w-full flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-gray-50 dark:hover:bg-black-700 active:bg-gray-100 dark:active:bg-black-600 ${
        row.danger ? 'text-red-500' : 'text-black-900 dark:text-white'
      } ${index < arr.length - 1 ? 'border-b border-gray-100 dark:border-black-600' : ''}`}
    >
      <span
        className={`shrink-0 ${row.danger ? 'text-red-500' : 'text-black-700 dark:text-white'}`}
      >
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
      <div className="px-6 py-4 font-ibm text-black-900 dark:text-white max-w-md mx-auto">
        <h1 className="text-center font-semibold mb-8">{t('setting_title', 'ตั้งค่า')}</h1>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">
          {t('account_section', 'บัญชี')}
        </p>
        <div className="bg-white dark:bg-black-800 border border-gray-100 dark:border-black-600 rounded-2xl shadow-sm overflow-hidden mb-6">
          {accountRows.map((row, i, arr) => renderRow(row, i, arr))}
        </div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">
          {t('app_setting_section', 'การตั้งค่าแอป')}
        </p>
        <div className="bg-white dark:bg-black-800 border border-gray-100 dark:border-black-600 rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="flex items-center gap-4 px-4 py-3.5 border-b border-gray-100">
            <span className="shrink-0 text-black-700 dark:text-white">
              <IoLanguageOutline size={20} />
            </span>
            <span className="text-sm font-medium flex-1">{t('app_language', 'ภาษาแอป')}</span>
            <div className="flex gap-1 bg-gray-100 dark:bg-black-700 rounded-lg p-0.5">
              {LANGUAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={async () => {
                    startLoading();
                    try {
                      await actionUpdateSetting({ appLanguage: opt.value });
                      await i18n.changeLanguage(opt.value);
                    } finally {
                      setTimeout(stopLoading, 300);
                    }
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    appLanguage === opt.value
                      ? 'bg-white dark:bg-black-500 text-blue-600 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white'
                  }`}
                >
                  {t(`language_${opt.value}`, opt.label)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4 px-4 py-3.5 border-b border-gray-100">
            <span className="shrink-0 text-black-700 dark:text-white">
              <IoSparklesOutline size={20} />
            </span>
            <span className="text-sm font-medium flex-1">{t('ai_language', 'ภาษา AI')}</span>
            <div className="flex gap-1 bg-gray-100 dark:bg-black-700 rounded-lg p-0.5">
              {LANGUAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={async () => {
                    startLoading();
                    try {
                      await actionUpdateSetting({ aiLanguage: opt.value });
                    } finally {
                      setTimeout(stopLoading, 300);
                    }
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    aiLanguage === opt.value
                      ? 'bg-white dark:bg-black-500 text-blue-600 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white'
                  }`}
                >
                  {t(`language_${opt.value}`, opt.label)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4 px-4 py-3.5 border-b border-gray-100">
            <span className="shrink-0 text-black-700 dark:text-white">
              <IoContrastOutline size={20} />
            </span>
            <span className="text-sm font-medium flex-1">{t('theme_label', 'ธีม')}</span>
            <div className="flex gap-1 bg-gray-100 dark:bg-black-700 rounded-lg p-0.5">
              {THEME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={async () => {
                    startLoading();
                    try {
                      await actionUpdateSetting({ theme: opt.value });

                      const root = document.documentElement;

                      if (opt.value === 'dark') root.classList.add('dark');
                      else if (opt.value === 'light') root.classList.remove('dark');
                      else {
                        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                        root.classList.toggle('dark', isDark);
                      }
                    } finally {
                      setTimeout(stopLoading, 300);
                    }
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    theme === opt.value
                      ? 'bg-white dark:bg-black-500 text-blue-600 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white'
                  }`}
                >
                  {t(`theme_${opt.value}`, opt.label)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 px-4 py-3.5 border-b border-gray-100">
            <span className="shrink-0 text-black-700 dark:text-white">
              <IoNotificationsOutline size={20} />
            </span>
            <span className="text-sm font-medium flex-1">
              {t('notification_label', 'การแจ้งเตือน')}
            </span>
            <button
              onClick={handleToggleNotification}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                isNotificationEnabled ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                  isNotificationEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center gap-4 px-4 py-3.5">
            <span className="shrink-0 text-black-700 dark:text-white">
              <IoCalendarOutline size={20} />
            </span>
            <div className="flex flex-col flex-1">
              <span className="text-sm font-medium">
                {t('budget_start_date', 'วันเริ่มต้นรอบงบประมาณ')}
              </span>
              <span className="text-xs text-gray-400">
                {t('budget_reset_desc', {
                  date: budgetStartDate,
                  defaultValue: `ทุกเดือนจะรีเซ็ตในวันที่ ${budgetStartDate}`,
                })}
              </span>
            </div>
            <select
              value={budgetStartDate}
              onChange={(e) => actionUpdateSetting({ budgetStartDate: Number(e.target.value) })}
              className="text-sm text-black-900 dark:text-white border border-gray-200 dark:border-black-500 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-black-700"
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {t('date_format', { date: d, defaultValue: `วันที่ ${d}` })}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">
          {t('support_section', 'การสนับสนุน')}
        </p>
        <div className="bg-white dark:bg-black-800 border border-gray-100 dark:border-black-600 rounded-2xl shadow-sm overflow-hidden mb-6">
          {supportRows.map((row, i, arr) => renderRow(row, i, arr))}
        </div>

        <div className="bg-white dark:bg-black-800 border border-gray-100 dark:border-black-600 rounded-2xl shadow-sm overflow-hidden mb-10">
          {renderRow(
            {
              icon: <IoLogOutOutline size={20} />,
              label: t('logout_btn', 'ออกจากระบบ'),
              onClick: handleLogout,
              danger: true,
            },
            0,
            [{ icon: null, label: '', onClick: () => {} }],
          )}
        </div>

        <p className="text-center text-xs text-gray-300">
          {t('app_version', 'สติสตางค์ · v1.1.0')}
        </p>
      </div>
    </PageWrapper>
  );
};

export default Setting;
