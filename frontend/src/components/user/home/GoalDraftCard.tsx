import React, { useState } from 'react';
import { FaCheck, FaPen } from 'react-icons/fa6';
import { RxCross2 } from 'react-icons/rx';
import type { GoalDraftData, DraftStatus } from '../../../interface/home';
import MyGoal from '../../../assets/goal.png';

const GoalDraftCard: React.FC<{
  data: GoalDraftData;
  onConfirm: () => void;
  onCancel: () => void;
  onEdit: () => void;
  status: DraftStatus;
}> = ({ data, onConfirm, onCancel, onEdit, status }) => {
  const [isInteracted, setIsInteracted] = useState(false);

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

  const bgClass = isCancelled
    ? 'bg-gray-100 border-gray-200 opacity-60 grayscale bg-blue-600/20'
    : 'bg-blue-600/20';

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'ไม่กำหนดเวลา';
    return new Date(dateStr).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
    });
  };

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
            <img src={MyGoal} alt="goal img" className="w-11 h-11 object-contain" />
            <div className="flex flex-col min-w-0">
              <span
                className={`text-base font-bold uppercase tracking-wider mb-0.5 ${
                  isCancelled ? 'text-gray-400' : 'text-black-900'
                }`}
              >
                เป้าหมายใหม่
              </span>
              <span className="text-black text-sm leading-tight truncate pr-2 font-normal">
                {data.name}
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="font-bold text-xl text-black">{data.amount.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">{formatDate(data.deadline)}</div>
          </div>
        </div>
      </div>

      {shouldShowButtons && (
        <div className="animate-fade-in mt-3 pl-1">
          <p className="text-black text-sm mb-3 font-normal">
            ให้น้องสติสร้างเป้าหมายนี้เลยมั้ยครับ?
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

export default GoalDraftCard;
