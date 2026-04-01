import useAuthStore from '../../store/authStore';
import { Link } from 'react-router-dom';
import type { SidebarProps } from '../../interface/components';
import { useTranslation } from 'react-i18next';
import { RxCross2 } from 'react-icons/rx';
import {
  MdHome,
  MdAutoAwesome,
  MdPieChart,
  MdCategory,
  MdSettings,
  MdLogout,
} from 'react-icons/md';

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const actionLogout = useAuthStore((state) => state.actionLogout);
  const user = useAuthStore((state) => state.user);
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
          fixed bg-white dark:bg-black-800 dark:border-t md:dark:border-t-0 md:dark:border-l dark:border-black-600 shadow-2xl dark:shadow-black-950 text-black-900 dark:text-white transition-transform duration-300 z-50
          w-full h-[calc(100%-80px)] bottom-0 left-0 rounded-t-3xl
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
          md:w-1/3 md:h-full md:top-0 md:right-0 md:left-auto md:rounded-none md:rounded-l-3xl min-w-[24rem]
          ${isOpen ? 'md:translate-x-0' : 'md:translate-x-full'}
          md:translate-y-0
        `}
      >
        <div className="flex flex-col justify-between h-full">
          <div>
            <div className="flex justify-between items-center px-9 pt-8 pb-4 md:pb-8">
              <div className="hidden md:flex items-center gap-3 pl-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-sm line-clamp-1">
                    {user?.name.toLocaleUpperCase()}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 line-clamp-1">
                    {user?.email}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="hidden md:flex w-10 h-10 justify-center items-center rounded-full bg-gray-100 dark:bg-black-700 hover:bg-gray-200 dark:hover:bg-black-600 transition-colors shadow-sm"
                aria-label="Close menu"
              >
                <RxCross2 size={24} className="text-black-900 dark:text-white" />
              </button>
            </div>

            <div className="px-3 py-2 md:py-0">
              <div className="flex flex-col gap-3 px-9">
                <Link
                  to="/user"
                  onClick={onClose}
                  className="py-2 flex items-center gap-3 font-semibold text-lg cursor-pointer hover:text-blue-500 dark:hover:text-blue-400 transition-colors group"
                >
                  <MdHome
                    size={26}
                    className="text-gray-700 dark:text-gray-300 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors"
                  />
                  {t('home', 'หน้าหลัก')}
                </Link>
                <Link
                  to="/user/satang"
                  onClick={onClose}
                  className="py-2 flex items-center gap-3 font-semibold text-lg cursor-pointer hover:text-blue-500 dark:hover:text-blue-400 transition-colors group"
                >
                  <MdAutoAwesome
                    size={26}
                    className="text-blue-600 dark:text-blue-400 group-hover:scale-110 group-hover:text-blue-500 dark:group-hover:text-blue-300 transition-all"
                  />
                  {t('chat_with_satang', 'แชทกับพี่สตางค์')}
                </Link>
                <Link
                  to="/user/summary"
                  onClick={onClose}
                  className="py-2 flex items-center gap-3 font-semibold text-lg cursor-pointer hover:text-blue-500 dark:hover:text-blue-400 transition-colors group"
                >
                  <MdPieChart
                    size={26}
                    className="text-gray-700 dark:text-gray-300 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors"
                  />
                  {t('summary', 'สรุปรายรับ รายจ่าย')}
                </Link>
                <Link
                  to="/user/categories"
                  onClick={onClose}
                  className="py-2 flex items-center gap-3 font-semibold text-lg cursor-pointer hover:text-blue-500 dark:hover:text-blue-400 transition-colors group"
                >
                  <MdCategory
                    size={26}
                    className="text-gray-700 dark:text-gray-300 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors"
                  />
                  {t('manage_categories', 'จัดการหมวดหมู่')}
                </Link>
                <Link
                  to="/user/setting"
                  onClick={onClose}
                  className="py-2 flex items-center gap-3 font-semibold text-lg cursor-pointer hover:text-blue-500 dark:hover:text-blue-400 transition-colors group"
                >
                  <MdSettings
                    size={26}
                    className="text-gray-700 dark:text-gray-300 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors"
                  />
                  {t('settings', 'การตั้งค่า')}
                </Link>
              </div>
            </div>
          </div>

          <div
            onClick={actionLogout}
            className="py-2 px-9 mx-3 flex items-center gap-3 font-semibold text-lg mb-8 cursor-pointer hover:text-red-500 transition-colors group"
          >
            <MdLogout
              size={26}
              className="text-gray-700 dark:text-gray-300 group-hover:text-red-500 transition-colors"
            />
            {t('logout', 'ออกจากระบบ')}
          </div>
        </div>
      </div>
    </>
  );
}
