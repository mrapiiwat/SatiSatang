import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoChevronBackOutline } from 'react-icons/io5';

const BackButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="px-6 py-2">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 cursor-pointer">
        <IoChevronBackOutline />
        <span className="font-light">ย้อนกลับ</span>
      </button>
    </div>
  );
};

export default BackButton;
