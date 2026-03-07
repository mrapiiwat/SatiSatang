import React, { useState, useEffect } from 'react';
import { FaCheck, FaPen, FaChartPie } from 'react-icons/fa6';
import { RxCross2 } from 'react-icons/rx';
import type { BudgetDraftData, CategoryType, DraftStatus } from '../../../interface/home';
import axios from '../../../api/axios';
import Image from '../../Image';

const BudgetDraftCard: React.FC<{
  data: BudgetDraftData;
  onConfirm: () => void;
  onCancel: () => void;
  onEdit: () => void;
  status: DraftStatus;
}> = ({ data, onConfirm, onCancel, onEdit, status }) => {
  const [isInteracted, setIsInteracted] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryIcon, setCategoryIcon] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await axios.get('/categories');
        const cats: CategoryType[] = res.data.data || [];
        const found = cats.find((c) => c.id === data.categoryId);
        if (found) {
          setCategoryName(found.name);
          setCategoryIcon(found.icon);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategory();
  }, [data.categoryId]);

  const handleConfirm = () => {
    if (isInteracted) return;
    setIsInteracted(true);
    onConfirm();
  };

  const handleCancel = () => {
    if (isInteracted) return;
    setIsInteracted(true);
    onCancel();
  };

  const shouldShowButtons = status === 'pending' && !isInteracted;
  const isCancelled = status === 'cancelled';

  const freqMap: Record<string, string> = {
    DAILY: 'วัน',
    WEEKLY: 'สัปดาห์',
    MONTHLY: 'เดือน',
    YEARLY: 'ปี',
  };

  const bgClass = isCancelled
    ? 'bg-gray-100 border-gray-200 opacity-60 grayscale bg-blue-600/20'
    : 'bg-blue-600/20';

  return (
    <div className="w-full max-w-96 mt-4 mb-2 animate-fade-in-up">
      <div
        className={`relative p-4 rounded-2xl rounded-tl-none transition-all duration-300 border border-transparent shadow-sm group ${bgClass}`}
      >
        {shouldShowButtons && (
          <button
            onClick={onEdit}
            className="absolute top-[-10px] right-[-10px] bg-white border border-blue-600/20 hover:bg-gray-50 rounded-full p-2 transition-all cursor-pointer z-10 shadow-sm"
            title="แก้ไขรายละเอียด"
          >
            <FaPen size={10} className="text-gray-600" />
          </button>
        )}

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-11 h-11 bg-[#2D2D2D] rounded-full flex items-center justify-center shrink-0 overflow-hidden text-white">
              {categoryIcon ? (
                <Image
                  src={categoryIcon}
                  alt="icon"
                  className="w-full h-full object-cover border-2 border-black-900/70 rounded-full"
                />
              ) : (
                <FaChartPie className="text-sm" />
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <span className="font-bold text-black text-base">ตั้งงบประมาณ</span>
              <span className="text-black text-sm leading-tight truncate pr-2 font-normal">
                {categoryName || 'หมวดทั่วไป'}
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="font-bold text-xl text-black">{data.amount.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">
              / {freqMap[data.frequency] || data.frequency}
            </div>
          </div>
        </div>
      </div>
      {shouldShowButtons && (
        <div className="animate-fade-in mt-3 pl-1">
          <p className="text-black text-sm mb-3 font-normal">
            ให้น้องสติบันทึกงบประมาณนี้เลยมั้ยครับ?
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              className="w-12 h-12 rounded-full bg-[#E9FBC6] hover:bg-[#d8f0b0] flex items-center justify-center transition-colors shadow-sm cursor-pointer"
            >
              <FaCheck className="text-[#5C7C26] text-lg" />
            </button>

            <button
              onClick={handleCancel}
              className="w-12 h-12 rounded-full bg-[#F0F0F0] hover:bg-[#e0e0e0] flex items-center justify-center transition-colors shadow-sm cursor-pointer"
            >
              <RxCross2 className="text-[#555555] text-xl" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetDraftCard;
