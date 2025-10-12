import { useState } from 'react';
import { LuEye, LuEyeClosed } from 'react-icons/lu';

const mockUsers = [
  {
    id: 1,
    name: 'Suda Local',
    email: 'suda@email.com',
    password: 'hashed_password_here',
    provider: 'local',
  },
];

const Account = ({ userId = 1 }) => {
  const user = mockUsers.find((u) => u.id === userId);
  const [name, setName] = useState(user?.name || '');
  const [isEdited, setIsEdited] = useState(false);

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSaveName = () => {
    if (!name.trim()) return;
    setIsEdited(false);
    setPopupMessage('แก้ไขชื่อผู้ใช้งานสำเร็จ');
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 2000);
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('รหัสผ่านไม่ตรงกัน');
      return;
    }
    setPasswordError('');
    setPopupMessage('เปลี่ยนรหัสผ่านสำเร็จ');
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 2000);
    setIsChangingPassword(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  if (!user) return <div>ไม่พบบัญชีผู้ใช้</div>;

  return (
    <div className="relative px-6 py-8 font-ibm text-black-900 min-h-screen">

      {/* Popup แจ้งเตือนว่าแก้ไขชื่อหรือบันทึกรหัสผ่านเสร็จแล้ว */}
      <div
        className={`fixed top-4 left-1/2 transform -translate-x-1/2 bg-black-300 text-black-900 px-6 py-2 rounded-lg text-sm shadow-md transition-all duration-500 ease-in-out ${
          showPopup
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
        style={{ zIndex: 9999 }}
      >
        {popupMessage}
      </div>

      <style>
        {`
          input:focus {
            border-bottom-color: #2563eb !important; /* Tailwind's blue-600 */
          }
        `}
      </style>

      <h1 className="text-center font-semibold mb-8">บัญชีผู้ใช้</h1>

      {!isChangingPassword ? (
        <>
          {/* ชื่อผู้ใช้งาน */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-1">ชื่อผู้ใช้งาน</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setIsEdited(true);
              }}
              className={`w-full border-b focus:outline-none pb-1 ${
                isEdited ? 'border-blue-600' : 'border-black-400'
              }`}
              placeholder="กรอกชื่อผู้ใช้งาน"
            />
          </div>

          {/* รหัสผ่าน */}
          <div className="mb-8">
            <label className="block text-sm font-semibold mb-1">รหัสผ่าน</label>

            {user.provider === 'google' || user.provider === 'facebook' ? (
              <input
                type="password"
                value="*************"
                readOnly
                className="w-full border-b border-black-400 text-black-500 bg-transparent cursor-not-allowed pb-1"
              />
            ) : (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="w-full border-b border-black-400 text-black-900 text-left pb-1"
              >
                *************
              </button>
            )}
          </div>

          {/* ปุ่มบันทึก */}
          <div className="flex justify-end">
            <button
              disabled={!isEdited || !name.trim()}
              onClick={handleSaveName}
              className={`px-6 py-2 rounded-md text-white text-sm font-semibold ${
                isEdited && name.trim()
                  ? 'bg-blue-600'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              บันทึก
            </button>
          </div>

          {/* ปุ่มลบบัญชี */}
          <div className="fixed left-0 bottom-8 w-full flex justify-center">
            <button className="text-[#FF5F57] font-medium">ลบบัญชี</button>
          </div>
        </>
      ) : (
        <>
          {/* หน้าเปลี่ยนรหัสผ่าน */}
          <h2 className="text-center font-semibold mb-6">เปลี่ยนรหัสผ่าน</h2>

          <div className="space-y-6">
            {/* รหัสผ่านเก่า */}
            <div>
              <label className="block text-sm mb-1">รหัสผ่านเก่า</label>
              <div className="flex items-center border-b border-gray-300">
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="flex-1 focus:outline-none py-1"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="text-gray-600"
                >
                  {showOldPassword ? <LuEye /> : <LuEyeClosed />}
                </button>
              </div>
            </div>

            {/* รหัสผ่านใหม่ */}
            <div>
              <label className="block text-sm mb-1">รหัสผ่านใหม่</label>
              <div className="flex items-center border-b border-gray-300">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="flex-1 focus:outline-none py-1"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="text-gray-600"
                >
                  {showNewPassword ? <LuEye /> : <LuEyeClosed />}
                </button>
              </div>
            </div>

            {/* ยืนยันรหัสผ่าน */}
            <div>
              <label className="block text-sm mb-1">ยืนยันรหัสผ่าน</label>
              <div className="flex items-center border-b border-gray-300">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="flex-1 focus:outline-none py-1"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="text-gray-600"
                >
                  {showConfirmPassword ? <LuEye /> : <LuEyeClosed />}
                </button>
              </div>
              {passwordError && (
                <p className="text-red-500 text-sm mt-1">{passwordError}</p>
              )}
            </div>

            {/* ปุ่มกลับ / บันทึก */}
            <div className="flex justify-between items-center mt-6">
              <button
                type="button"
                onClick={() => setIsChangingPassword(false)}
                className="text-black-600 font-medium"
              >
                กลับ
              </button>
              <button
                type="button"
                onClick={handlePasswordChange}
                className="px-6 py-2 rounded-md bg-blue-600 text-white font-semibold"
              >
                บันทึก
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Account;
