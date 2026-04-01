import React from 'react';
import { useTranslation } from 'react-i18next';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  confirmText?: string;
  cancelText?: string;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  confirmText,
  cancelText,
}) => {
  const { t } = useTranslation();
  const displayTitle = title || t('delete_confirm_title', 'ต้องการลบข้อมูลใช่หรือไม่?');
  const displayConfirmText = confirmText || t('delete_confirm_btn', 'ใช่ ลบเลย');
  const displayCancelText = cancelText || t('delete_cancel_btn', 'ยังไม่ลบตอนนี้');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black-900/80 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-black-800 rounded-[2rem] p-8 flex flex-col items-center w-full max-w-[350px] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="mb-5">
          <svg
            width="90"
            height="90"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="15" y="20" width="70" height="8" rx="4" fill="#EE4B60" />
            <path
              d="M38 20V15C38 12.2386 40.2386 10 43 10H57C59.7614 10 62 12.2386 62 15V20"
              stroke="#EE4B60"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M22 32H78V76C78 83.732 71.732 90 64 90H36C28.268 90 22 83.732 22 76V32Z"
              fill="#EE4B60"
            />
            <path d="M38 46L62 70" stroke="white" strokeWidth="8" strokeLinecap="round" />
            <path d="M62 46L38 70" stroke="white" strokeWidth="8" strokeLinecap="round" />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 text-center">
          {displayTitle}
        </h2>

        <button
          onClick={onConfirm}
          className="bg-[#EE4B60] hover:bg-[#d93a4d] text-white text-lg font-medium py-2.5 w-full max-w-[240px] rounded-xl mb-4 transition-colors shadow-md"
        >
          {displayConfirmText}
        </button>

        <button
          onClick={onClose}
          className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-base font-medium underline underline-offset-[5px] transition-colors"
        >
          {displayCancelText}
        </button>
      </div>
    </div>
  );
};

export default DeleteModal;
