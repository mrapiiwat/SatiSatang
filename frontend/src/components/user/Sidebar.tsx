import useAuthStore from '../../store/authStore';
import { Link } from 'react-router-dom';
import type { SidebarProps } from '../../interface/components';
import { useTranslation } from 'react-i18next';

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const actionLogout = useAuthStore((state) => state.actionLogout);
  const { t } = useTranslation();
  return (
    <>
      <div
        className={`fixed inset-0 bg-black-900 bg-opacity-80 transition-opacity duration-300 z-40 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={onClose}
      ></div>

      <div
        className={`
          fixed bg-white dark:bg-black-800 dark:border-t md:dark:border-t-0 md:dark:border-l dark:border-black-600 shadow-2xl dark:shadow-black-950 text-black-900 dark:text-white p-4 transition-transform duration-300 z-50
          w-full h-[calc(100%-80px)] bottom-0 left-0 rounded-t-3xl
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
          md:w-1/3 md:h-full md:top-0 md:right-0 md:left-auto md:rounded-none md:rounded-l-3xl min-w-96
          ${isOpen ? 'md:translate-x-0' : 'md:translate-x-full'}
          md:translate-y-0
        `}
      >
        <div className="flex flex-col justify-between h-full">
          <div className="px-3 py-5">
            <div className="flex flex-col gap-4 px-9">
              <Link
                to="/user"
                onClick={onClose}
                className="py-2 font-semibold text-lg cursor-pointer hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              >
                {t('home', 'หน้าหลัก')}
              </Link>
              <Link
                to="/user/satang"
                onClick={onClose}
                className="py-2 font-semibold text-lg cursor-pointer hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              >
                {t('chat_with_satang', 'แชทกับพี่สตางค์')}
              </Link>
              <Link
                to="/user/summary"
                onClick={onClose}
                className="py-2 font-semibold text-lg cursor-pointer hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              >
                {t('summary', 'สรุปรายรับ รายจ่าย')}
              </Link>
              <Link
                to="/user/categories"
                onClick={onClose}
                className="py-2 font-semibold text-lg cursor-pointer hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              >
                {t('manage_categories', 'จัดการหมวดหมู่')}
              </Link>
              <Link
                to="/user/setting"
                onClick={onClose}
                className="py-2 font-semibold text-lg cursor-pointer hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              >
                {t('settings', 'การตั้งค่า')}
              </Link>
            </div>
          </div>
          <div
            onClick={actionLogout}
            className="py-2 px-9 font-semibold text-lg mb-8 cursor-pointer hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
          >
            {t('logout', 'ออกจากระบบ')}
          </div>
        </div>
      </div>
    </>
  );
}
