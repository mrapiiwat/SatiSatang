import React from 'react';
import type { AddMenuProps } from '../../../interface/home';
import { useTranslation } from 'react-i18next';

const AddMenu: React.FC<AddMenuProps> = ({ isOpen, onSelect, onClose }) => {
  const { t } = useTranslation();
  return (
    <>
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-transparent z-40" onClick={onClose}></div>
          <div
            className="absolute bg-blue-100 w-52 h-52 left-0 bottom-20 rounded-3xl shadow-xl shadow-black-800 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <ul className="h-full flex flex-col justify-evenly">
              {['upload', 'manual', 'budget', 'goal'].map((item) => (
                <li
                  key={item}
                  onClick={() => onSelect(item)}
                  className={`font-semibold text-black-900 h-full flex items-center px-5 cursor-pointer hover:bg-blue-50 ${item === 'upload' ? 'hover:rounded-t-3xl' : null} ${item === 'goal' ? 'hover:rounded-b-3xl' : null} `}
                >
                  {item === 'upload' && t('upload_slip', 'อัปโหลดสลิป')}
                  {item === 'manual' && t('manual_record', 'บันทึกรายรับรายจ่ายเอง')}
                  {item === 'budget' && t('set_budget_menu', 'ตั้งงบ')}
                  {item === 'goal' && t('set_goal_menu', 'ตั้งเป้าหมาย')}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </>
  );
};

export default AddMenu;
