import React, { useState, useRef, useEffect } from 'react';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import type { MonthHeaderProps } from '../../interface/components';
import { useTranslation } from 'react-i18next';

const MonthHeader: React.FC<MonthHeaderProps> = ({
  selectedMonth,
  selectedYear,
  onMonthChange,
}) => {
  const { t, i18n } = useTranslation();
  const [showPicker, setShowPicker] = useState(false);

  const pickerRef = useRef<HTMLDivElement>(null);

  const monthsThai = [
    t('month_jan', 'มกราคม'),
    t('month_feb', 'กุมภาพันธ์'),
    t('month_mar', 'มีนาคม'),
    t('month_apr', 'เมษายน'),
    t('month_may', 'พฤษภาคม'),
    t('month_jun', 'มิถุนายน'),
    t('month_jul', 'กรกฎาคม'),
    t('month_aug', 'สิงหาคม'),
    t('month_sep', 'กันยายน'),
    t('month_oct', 'ตุลาคม'),
    t('month_nov', 'พฤศจิกายน'),
    t('month_dec', 'ธันวาคม'),
  ];

  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showPicker && pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPicker]);

  const handlePrev = () => {
    if (selectedMonth === 1) onMonthChange(12, selectedYear - 1);
    else onMonthChange(selectedMonth - 1, selectedYear);
  };

  const handleNext = () => {
    if (
      selectedYear > currentYear ||
      (selectedYear === currentYear && selectedMonth >= currentMonth)
    )
      return;
    if (selectedMonth === 12) onMonthChange(1, selectedYear + 1);
    else onMonthChange(selectedMonth + 1, selectedYear);
  };

  return (
    <div className="flex flex-col items-center justify-center mb-8 relative">
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={handlePrev}
          className="text-black-900 text-2xl hover:opacity-50 transition"
        >
          <IoIosArrowBack />
        </button>

        <button
          onClick={() => setShowPicker(!showPicker)}
          className="border border-black-900 rounded-[8px] w-36 px-4 py-1 text-sm font-semibold text-black-900"
        >
          {monthsThai[selectedMonth - 1]} {selectedYear + (i18n.language === 'th' ? 543 : 0)}
        </button>

        <button
          onClick={handleNext}
          disabled={
            selectedYear > currentYear ||
            (selectedYear === currentYear && selectedMonth >= currentMonth)
          }
          className={`text-black-900 text-2xl transition ${
            selectedYear > currentYear ||
            (selectedYear === currentYear && selectedMonth >= currentMonth)
              ? 'opacity-20 cursor-not-allowed'
              : 'hover:opacity-50'
          }`}
        >
          <IoIosArrowForward />
        </button>
      </div>

      {showPicker && (
        <div
          ref={pickerRef}
          className="absolute top-12 z-50 bg-white border border-gray-100 shadow-2xl rounded-2xl p-4 w-72 mt-2 animate-in fade-in zoom-in duration-200"
        >
          <div className="flex justify-between items-center mb-4 px-2">
            <button
              onClick={() => onMonthChange(selectedMonth, selectedYear - 1)}
              className="p-1 hover:bg-gray-100 rounded-full transition"
            >
              <IoIosArrowBack size={16} />
            </button>
            <span className="font-bold text-lg">
              {selectedYear + (i18n.language === 'th' ? 543 : 0)}
            </span>
            <button
              onClick={() => onMonthChange(selectedMonth, selectedYear + 1)}
              disabled={selectedYear >= currentYear}
              className={`p-1 hover:bg-gray-100 rounded-full transition ${selectedYear >= currentYear ? 'invisible' : ''}`}
            >
              <IoIosArrowForward size={16} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-y-3 gap-x-2">
            {monthsThai.map((month, index) => {
              const isSelected = selectedMonth === index + 1;
              const isFuture = selectedYear === currentYear && index + 1 > currentMonth;

              return (
                <button
                  key={month}
                  disabled={isFuture}
                  onClick={() => {
                    onMonthChange(index + 1, selectedYear);
                    setShowPicker(false);
                  }}
                  className={`py-2.5 rounded-xl text-[15px] font-medium transition-all ${
                    isSelected
                      ? 'bg-[#33302E] text-white shadow-md'
                      : 'text-gray-400 hover:text-black-900 hover:bg-gray-50'
                  } ${isFuture ? 'opacity-10 cursor-not-allowed' : ''}`}
                >
                  {month}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthHeader;
