import React from 'react';
import { RxCross2 } from 'react-icons/rx';
import type { UploadProps } from '../../types/home';

const Upload: React.FC<UploadProps> = ({ onClose }) => {
  return (
    <div className="flex justify-center items-center px-6">
      <div className="bg-white w-full max-w-96 min-h-[300px] rounded-2xl py-7 px-8">
        <div className="flex justify-between items-center mb-5">
          <h4 className="font-medium">อัปโหลดรายการ</h4>
          <div
            onClick={onClose}
            className="bg-black-300 flex justify-center items-center rounded-full w-12 h-12 hover:bg-black-400 cursor-pointer"
          >
            <RxCross2 size={25} />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-5 py-10">
          <div className="text-6xl">📋</div>
          <p className="text-lg text-gray-600 text-center">ยังไม่พร้อมให้บริการ</p>
          <p className="text-sm text-gray-500 text-center">ฟีเจอร์นี้อยู่ระหว่างการพัฒนา</p>
        </div>
      </div>
    </div>
  );
};

export default Upload;
