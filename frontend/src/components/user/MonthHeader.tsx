import React from 'react';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import type { MonthHeaderProps } from '../../types/components';

const MonthHeader: React.FC<MonthHeaderProps> = ({
  selectedMonth,
  selectedYear,
  onMonthChange,
}) => {
  const monthsThai = [
    'มกราคม',
    'กุมภาพันธ์',
    'มีนาคม',
    'เมษายน',
    'พฤษภาคม',
    'มิถุนายน',
    'กรกฎาคม',
    'สิงหาคม',
    'กันยายน',
    'ตุลาคม',
    'พฤศจิกายน',
    'ธันวาคม',
  ];

  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const handlePrev = () => {
    if (selectedMonth === 1) onMonthChange(12, selectedYear - 1);
    else onMonthChange(selectedMonth - 1, selectedYear);
  };

  const handleNext = () => {
    if (
      selectedYear > currentYear ||
      (selectedYear === currentYear && selectedMonth >= currentMonth)
    ) {
      return;
    }

    if (selectedMonth === 12) onMonthChange(1, selectedYear + 1);
    else onMonthChange(selectedMonth + 1, selectedYear);
  };

  const handleCalendarClick = () => alert('เปิดปฏิทินเลือกเดือนและปี');

  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={handlePrev}
          className="text-black-900 text-2xl hover:opacity-70 transition"
        >
          <IoIosArrowBack />
        </button>

        <button
          onClick={handleCalendarClick}
          className="border border-black-900 rounded-[8px] px-4 py-1 text-sm font-semibold text-black-900"
        >
          {monthsThai[selectedMonth - 1]} {selectedYear + 543}
        </button>

        <button
          onClick={handleNext}
          className={`text-black-900 text-2xl transition ${selectedYear > currentYear || (selectedYear === currentYear && selectedMonth >= currentMonth) ? 'opacity-30 cursor-not-allowed' : 'hover:opacity-70'}`}
          disabled={
            selectedYear > currentYear ||
            (selectedYear === currentYear && selectedMonth >= currentMonth)
          }
        >
          <IoIosArrowForward />
        </button>
      </div>
    </div>
  );
};

export default MonthHeader;
