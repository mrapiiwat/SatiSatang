import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoChevronBackOutline } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';

const BackButton: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="px-6 py-2">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 cursor-pointer">
        <IoChevronBackOutline />
        <span className="font-medium">{t('back_btn', 'ย้อนกลับ')}</span>
      </button>
    </div>
  );
};

export default BackButton;
