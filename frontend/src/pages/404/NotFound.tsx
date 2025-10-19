import React from 'react';

const NotFound: React.FC = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white px-4">
      <div className="text-center">
        <h1 className="text-8xl md:text-9xl font-bold text-gray-200 mb-4">404</h1>
        <h2 className="text-2xl md:text-3xl font-medium text-gray-800 mb-3">
          ไม่พบหน้าที่คุณค้นหา
        </h2>
        <p className="text-gray-500 mb-8">ขออภัย หน้าที่คุณกำลังมองหาอาจถูกย้ายหรือไม่มีอยู่จริง</p>
      </div>
    </div>
  );
};

export default NotFound;
