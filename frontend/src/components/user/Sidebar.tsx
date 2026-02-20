import useAuthStore from '../../store/authStore';
import { Link } from 'react-router-dom';
import type { SidebarProps } from '../../interface/components';

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const actionLogout = useAuthStore((state) => state.actionLogout);
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
          fixed bg-white text-black-900 p-4 transition-transform duration-300 z-50
          w-full h-[calc(100%-80px)] bottom-0 left-0 rounded-t-3xl
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
          md:w-1/3 md:h-full md:top-0 md:right-0 md:left-auto md:rounded-none md:rounded-l-3xl min-w-96
          ${isOpen ? 'md:translate-x-0' : 'md:translate-x-full'}
          md:translate-y-0
        `}
      >
        <div className="flex flex-col justify-between h-full">
          <div className="px-3 py-5">
            <Link
              to="/user/satang"
              onClick={onClose}
              className="bg-blue-600 rounded-2xl h-16 flex items-center hover:bg-blue-600/95 active:scale-105 justify-center mb-7 cursor-pointer"
            >
              <h1 className="text-white text-2xl font-medium">แชทกับพี่สตางค์</h1>
            </Link>
            <div className="flex flex-col gap-4 px-9">
              <Link
                to="/user"
                onClick={onClose}
                className="py-2 font-semibold text-lg cursor-pointer"
              >
                หน้าหลัก
              </Link>
              <Link
                to="/user/summary"
                onClick={onClose}
                className="py-2 font-semibold text-lg cursor-pointer"
              >
                สรุปรายรับ รายจ่าย
              </Link>
              <Link
                to="/user/categories"
                onClick={onClose}
                className="py-2 font-semibold text-lg cursor-pointer"
              >
                จัดการหมวดหมู่
              </Link>
              <Link
                to="/user/stock"
                onClick={onClose}
                className="py-2 font-semibold text-lg cursor-pointer"
              >
                ราคาตลาด
              </Link>
              <Link
                to="/user/feedback"
                onClick={onClose}
                className="py-2 font-semibold text-lg cursor-pointer"
              >
                รายงานปัญหา
              </Link>
              <Link
                to="/user/account"
                onClick={onClose}
                className="py-2 font-semibold text-lg cursor-pointer"
              >
                บัญชี
              </Link>
            </div>
          </div>
          <div
            onClick={actionLogout}
            className="py-2 px-9 font-semibold text-lg mb-8 cursor-pointer"
          >
            ออกจากระบบ
          </div>
        </div>
      </div>
    </>
  );
}
