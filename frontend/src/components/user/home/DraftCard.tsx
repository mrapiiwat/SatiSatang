import React, { useState, useEffect } from 'react';
import { FaCheck, FaPen } from 'react-icons/fa6';
import type { DraftData, CategoryType, DraftStatus } from '../../../interface/home';
import { RxCross2 } from 'react-icons/rx';
import axios from '../../../api/axios';
import Image from '../../Image';
import goalIcon from '../../../assets/goal.png';
import { useTranslation } from 'react-i18next';

const DraftCard: React.FC<{
  data: DraftData;
  onConfirm: () => void;
  onCancel: () => void;
  onEdit: () => void;
  status: DraftStatus;
}> = ({ data, onConfirm, onCancel, onEdit, status }) => {
  const { t } = useTranslation();
  const isExpense = data.type === 'EXPENSE';
  const transactionDate = data.date ? new Date(data.date) : new Date();
  const dateNum = transactionDate.getDate();
  const today = new Date();
  const isToday =
    transactionDate.getDate() === today.getDate() &&
    transactionDate.getMonth() === today.getMonth() &&
    transactionDate.getFullYear() === today.getFullYear();
  const monthNames = [
    t('month_jan_short', 'ม.ค.'),
    t('month_feb_short', 'ก.พ.'),
    t('month_mar_short', 'มี.ค.'),
    t('month_apr_short', 'เม.ย.'),
    t('month_may_short', 'พ.ค.'),
    t('month_jun_short', 'มิ.ย.'),
    t('month_jul_short', 'ก.ค.'),
    t('month_aug_short', 'ส.ค.'),
    t('month_sep_short', 'ก.ย.'),
    t('month_oct_short', 'ต.ค.'),
    t('month_nov_short', 'พ.ย.'),
    t('month_dec_short', 'ธ.ค.'),
  ];
  const displayTopText = isToday ? t('today', 'วันนี้') : monthNames[transactionDate.getMonth()];

  const [isInteracted, setIsInteracted] = useState(false);
  const [categoryIconUrl, setCategoryIconUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoryIcon = async () => {
      if (data.categoryId) {
        try {
          const res = await axios.get('/categories');
          const categories: CategoryType[] = res.data.data || [];
          const foundCategory = categories.find((c) => c.id === data.categoryId);
          if (foundCategory) {
            setCategoryIconUrl(foundCategory.icon);
          }
        } catch (err) {
          console.error('Error fetching categories:', err);
        }
      }
    };
    fetchCategoryIcon();
  }, [data.categoryId]);

  const handleConfirmClick = () => {
    setIsInteracted(true);
    onConfirm();
  };
  const handleCancelClick = () => {
    setIsInteracted(true);
    onCancel();
  };

  const isPending = status === 'pending';
  const shouldShowButtons = isPending && !isInteracted;

  const isCancelled = status === 'cancelled';
  const bgClass = isCancelled
    ? 'bg-gray-100 border-gray-200 opacity-60 grayscale bg-blue-600/20'
    : 'bg-blue-600/20';

  return (
    <div className="w-full max-w-96 mt-4 mb-2 animate-fade-in-up">
      <div className="flex gap-3 items-start relative ">
        <div className="flex gap-2 h-full shrink-0 ">
          <div
            className={`w-1 h-[74px] rounded-full ${isCancelled ? 'bg-gray-300' : 'bg-blue-700'}`}
          ></div>
          <div className="flex flex-col gap-1 justify-center items-center w-full">
            <span
              className={`text-base font-medium leading-none mb-1 ${isCancelled ? 'text-gray-400' : 'text-blue-700'}`}
            >
              {displayTopText}
            </span>
            <span
              className={`text-base font-medium leading-none tracking-tighter ${isCancelled ? 'text-gray-400' : 'text-blue-700'}`}
            >
              {dateNum}
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div
            className={`p-4 flex items-center justify-between shadow-sm border border-transparent mb-3 relative group rounded-md ${bgClass}`}
          >
            {shouldShowButtons && (
              <button
                onClick={onEdit}
                className="absolute top-[-10px] right-[-10px] bg-white border border-blue-600/20 rounded-full p-2 cursor-pointer z-10 shadow-sm"
                title={t('edit_details', 'แก้ไขรายละเอียด')}
              >
                <FaPen size={10} className="text-gray-600" />
              </button>
            )}

            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-11 h-11 bg-[#2D2D2D] rounded-full flex items-center justify-center shrink-0">
                {categoryIconUrl ? (
                  <Image
                    src={categoryIconUrl}
                    alt="icon"
                    className="w-full h-full object-cover border-2 border-black-900/70 rounded-full"
                  />
                ) : (
                  <img src={goalIcon} alt="goal" />
                )}
              </div>

              <div className="flex flex-col min-w-0">
                <span className="font-bold text-black text-base">
                  {data.isGoal
                    ? t('goal_label', 'เป้าหมาย')
                    : isExpense
                      ? t('expense', 'รายจ่าย')
                      : t('income', 'รายรับ')}
                </span>
                <span className="text-black text-sm leading-tight truncate pr-2 font-normal">
                  {data.description || t('no_description', 'ไม่ระบุรายการ')}
                </span>
              </div>
            </div>

            <div className="font-bold text-xl text-black shrink-0">{data.amount}</div>
          </div>

          {shouldShowButtons && (
            <div className="animate-fade-in">
              <p className="text-black text-sm mb-3 font-normal">
                {t('prompt_save_transaction', {
                  type: isExpense ? t('expense', 'รายจ่าย') : t('income', 'รายรับ'),
                  defaultValue: `ให้น้องสติบันทึกลงในรายการ{{type}}เลยมั้ยครับ?`,
                })}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleConfirmClick}
                  className="p-2 w-12 h-12 rounded-full bg-[#E9FBC6] hover:bg-[#d8f0b0] flex items-center justify-center transition-colors shadow-sm"
                >
                  <FaCheck className="text-[#5C7C26] text-lg" />
                </button>

                <button
                  onClick={handleCancelClick}
                  className="w-12 h-12 rounded-full bg-[#F0F0F0] hover:bg-[#e0e0e0] flex items-center justify-center transition-colors shadow-sm"
                >
                  <RxCross2 className="text-[#555555] text-xl" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DraftCard;
