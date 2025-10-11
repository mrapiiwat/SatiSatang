import useAuthStore from '../../store/authStore';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const actionLogout = useAuthStore((state) => state.actionLogout);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-80 transition-opacity duration-300 z-40 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={onClose}
      ></div>

      <div
        className={`
          fixed bg-white text-black p-4 transition-transform duration-300 z-40
          w-full h-[calc(100%-80px)] bottom-0 left-0 rounded-t-3xl
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
          md:w-1/3 md:h-full md:top-0 md:right-0 md:left-auto md:rounded-none md:rounded-l-3xl min-w-96
          ${isOpen ? 'md:translate-x-0' : 'md:translate-x-full'}
          md:translate-y-0
        `}
      >
        <div className="flex flex-col justify-between h-full">
          <div className="px-3 py-5">
            <div className="bg-[#5300E8] rounded-2xl h-16 flex items-center justify-center mb-7 cursor-pointer">
              <h1 className="text-white text-2xl font-medium">แชทกับพี่สตางค์</h1>
            </div>
            <ul className="space-y-6 px-9">
              <li className="py-2 font-medium text-base cursor-pointer">สรุปรายรับ รายจ่าย</li>
              <li className="py-2 font-medium text-base cursor-pointer">จัดการหมวดหมู่</li>
              <li className="py-2 font-medium text-base cursor-pointer">การตั้งค่า</li>
              <li className="py-2 font-medium text-base cursor-pointer">บัญชี</li>
              <li className="py-2 font-medium text-base cursor-pointer">แจ้งปัญหาหรือข้อเสนอแนะ</li>
            </ul>
          </div>
          <div
            onClick={actionLogout}
            className="py-2 px-9 font-medium text-base mb-8 cursor-pointer"
          >
            ออกจากระบบ
          </div>
        </div>
      </div>
    </>
  );
}
