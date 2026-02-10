import React, { useState, useEffect } from 'react';
import { FaCheck, FaUtensils, FaPen } from 'react-icons/fa6';
import type { DraftData } from '../../../interface/home';
import { RxCross2 } from 'react-icons/rx';
import axios from '../../../api/axios';
import Image from '../../Image';
import type { DraftStatus, CategoryType } from '../../../interface/home';

const DraftCard: React.FC<{
  data: DraftData;
  onConfirm: () => void;
  onCancel: () => void;
  onEdit: () => void;
  status: DraftStatus;
}> = ({ data, onConfirm, onCancel, onEdit, status }) => {
  const isExpense = data.type === 'EXPENSE';
  const today = new Date();
  const dateNum = today.getDate();
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

  return (
    <div className="w-full max-w-[55%] mt-4 mb-2 animate-fade-in-up">
      <div className="flex gap-3 items-start relative ">
        <div className="flex gap-2 h-full shrink-0 ">
          <div className="w-1 bg-blue-700 h-[74px]"></div>

          <div className="flex flex-col gap-1 justify-center items-center w-full">
            <span className="text-blue-700 font-semibold text-lg leading-none mb-1">วันนี้</span>
            <span className="text-blue-700 font-semibold text-lg leading-none tracking-tighter">
              {dateNum}
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div
            className={`p-4 flex items-center justify-between shadow-sm border border-transparent mb-3 relative group ${
              isExpense ? 'bg-[#DAD1F9]' : 'bg-[#DDF5CD]'
            }`}
          >
            {shouldShowButtons && (
              <button
                onClick={onEdit}
                className="absolute top-1 right-1 bg-white/50 hover:bg-white rounded-full p-1.5 transition-all cursor-pointer z-10"
                title="แก้ไขรายละเอียด"
              >
                <FaPen size={10} className="text-gray-600" />
              </button>
            )}

            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 bg-[#2D2D2D] rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                {categoryIconUrl ? (
                  <Image
                    src={categoryIconUrl}
                    alt="category icon"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUtensils className="text-white text-sm" />
                )}
              </div>

              <div className="flex flex-col min-w-0">
                <span className="font-bold text-black text-sm">
                  {isExpense ? 'รายจ่าย' : 'รายรับ'}
                </span>
                <span className="text-black text-sm leading-tight truncate pr-2 font-normal">
                  {data.description || 'ไม่ระบุรายการ'}
                </span>
              </div>
            </div>

            <div className="font-bold text-xl text-black shrink-0">{data.amount}</div>
          </div>

          {shouldShowButtons && (
            <div className="animate-fade-in">
              <p className="text-black text-sm mb-3 font-normal">
                ให้น้องสติบันทึกลงในรายการ{isExpense ? 'รายจ่าย' : 'รายรับ'}เลยมั้ยครับ?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleConfirmClick}
                  className="w-12 h-12 rounded-full bg-[#E9FBC6] hover:bg-[#d8f0b0] flex items-center justify-center transition-colors shadow-sm"
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
