import React, { useState, useRef, useEffect } from 'react';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { IoChevronDown } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';
import type { HeaderSummaryProps, SummaryPeriod } from '../../interface/components';

const HeaderSummary: React.FC<HeaderSummaryProps> = ({
  selectedDate,
  selectedPeriod,
  onDateChange,
  onPeriodChange,
}) => {
  const { t, i18n } = useTranslation();
  const [showPicker, setShowPicker] = useState(false);
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const [pickerYear, setPickerYear] = useState(selectedDate.getFullYear());
  const [yearGridStart, setYearGridStart] = useState(
    selectedDate.getFullYear() - (selectedDate.getFullYear() % 12),
  );

  const pickerRef = useRef<HTMLDivElement>(null);
  const periodMenuRef = useRef<HTMLDivElement>(null);

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

  const monthsShort = [
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

  const weekdaysShort = [
    t('weekday_mon_short', 'จ'),
    t('weekday_tue_short', 'อ'),
    t('weekday_wed_short', 'พ'),
    t('weekday_thu_short', 'พฤ'),
    t('weekday_fri_short', 'ศ'),
    t('weekday_sat_short', 'ส'),
    t('weekday_sun_short', 'อา'),
  ];

  const periodOptions: { value: SummaryPeriod; label: string }[] = [
    { value: 'year', label: t('period_year', 'รายปี') },
    { value: 'month', label: t('period_month', 'รายเดือน') },
    { value: 'week', label: t('period_week', 'รายสัปดาห์') },
  ];

  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const yearOffset = i18n.language === 'th' ? 543 : 0;

  const selectedMonth = selectedDate.getMonth() + 1;
  const selectedYear = selectedDate.getFullYear();

  const getWeekStart = (date: Date) => {
    const day = date.getDay();
    const diff = (day + 6) % 7;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() - diff);
  };

  const getWeekEnd = (date: Date) => {
    const start = getWeekStart(date);
    return new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showPicker && pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
      if (
        showPeriodMenu &&
        periodMenuRef.current &&
        !periodMenuRef.current.contains(event.target as Node)
      ) {
        setShowPeriodMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPicker, showPeriodMenu]);

  useEffect(() => {
    setPickerYear(selectedDate.getFullYear());
    setYearGridStart(selectedDate.getFullYear() - (selectedDate.getFullYear() % 12));
  }, [selectedDate, selectedPeriod]);

  const handlePrev = () => {
    const newDate = new Date(selectedDate);
    if (selectedPeriod === 'year') {
      newDate.setFullYear(newDate.getFullYear() - 1);
    } else if (selectedPeriod === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    onDateChange(newDate);
  };

  const handleNext = () => {
    if (isNextDisabled()) return;
    const newDate = new Date(selectedDate);
    if (selectedPeriod === 'year') {
      newDate.setFullYear(newDate.getFullYear() + 1);
    } else if (selectedPeriod === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    onDateChange(newDate);
  };

  const isNextDisabled = () => {
    if (selectedPeriod === 'year') return selectedYear >= currentYear;
    if (selectedPeriod === 'month') {
      return (
        selectedYear > currentYear ||
        (selectedYear === currentYear && selectedMonth >= currentMonth)
      );
    }
    return getWeekStart(selectedDate) >= getWeekStart(todayMidnight);
  };

  const getCentralLabel = () => {
    if (selectedPeriod === 'year') return `${selectedYear + yearOffset}`;
    if (selectedPeriod === 'month') {
      return `${monthsThai[selectedMonth - 1]} ${selectedYear + yearOffset}`;
    }
    const ws = getWeekStart(selectedDate);
    const we = getWeekEnd(selectedDate);
    const sameMonth = ws.getMonth() === we.getMonth();
    const sameYear = ws.getFullYear() === we.getFullYear();
    if (sameMonth) {
      return `${ws.getDate()} - ${we.getDate()} ${monthsShort[we.getMonth()]} ${we.getFullYear() + yearOffset}`;
    }
    if (sameYear) {
      return `${ws.getDate()} ${monthsShort[ws.getMonth()]} - ${we.getDate()} ${monthsShort[we.getMonth()]} ${we.getFullYear() + yearOffset}`;
    }
    return `${ws.getDate()} ${monthsShort[ws.getMonth()]} ${ws.getFullYear() + yearOffset} - ${we.getDate()} ${monthsShort[we.getMonth()]} ${we.getFullYear() + yearOffset}`;
  };

  const handleSelectPeriod = (period: SummaryPeriod) => {
    onPeriodChange(period);
    setShowPeriodMenu(false);
    setShowPicker(false);
  };

  const renderMonthPicker = () => (
    <>
      <div className="flex justify-between items-center mb-4 px-2">
        <button
          onClick={() => setPickerYear(pickerYear - 1)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-black-700 rounded-full transition"
        >
          <IoIosArrowBack size={16} />
        </button>
        <span className="font-bold text-lg dark:text-white">{pickerYear + yearOffset}</span>
        <button
          onClick={() => setPickerYear(pickerYear + 1)}
          disabled={pickerYear >= currentYear}
          className={`p-1 hover:bg-gray-100 dark:hover:bg-black-700 rounded-full transition ${pickerYear >= currentYear ? 'invisible' : ''}`}
        >
          <IoIosArrowForward size={16} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-y-3 gap-x-2">
        {monthsThai.map((month, index) => {
          const isSelected = selectedMonth === index + 1 && selectedYear === pickerYear;
          const isFuture = pickerYear === currentYear && index + 1 > currentMonth;

          return (
            <button
              key={month}
              disabled={isFuture}
              onClick={() => {
                onDateChange(new Date(pickerYear, index, 1));
                setShowPicker(false);
              }}
              className={`py-2.5 rounded-xl text-[15px] font-medium transition-all ${
                isSelected
                  ? 'bg-[#33302E] dark:bg-black-600 text-white shadow-md'
                  : 'text-gray-400 dark:text-gray-300 hover:text-black-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-black-700'
              } ${isFuture ? 'opacity-10 cursor-not-allowed' : ''}`}
            >
              {month}
            </button>
          );
        })}
      </div>
    </>
  );

  const renderYearPicker = () => {
    const years = Array.from({ length: 12 }, (_, i) => yearGridStart + i);
    return (
      <>
        <div className="flex justify-between items-center mb-4 px-2">
          <button
            onClick={() => setYearGridStart(yearGridStart - 12)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-black-700 rounded-full transition"
          >
            <IoIosArrowBack size={16} />
          </button>
          <span className="font-bold text-lg dark:text-white">
            {yearGridStart + yearOffset} - {yearGridStart + 11 + yearOffset}
          </span>
          <button
            onClick={() => setYearGridStart(yearGridStart + 12)}
            disabled={yearGridStart + 11 >= currentYear}
            className={`p-1 hover:bg-gray-100 dark:hover:bg-black-700 rounded-full transition ${yearGridStart + 11 >= currentYear ? 'invisible' : ''}`}
          >
            <IoIosArrowForward size={16} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-y-3 gap-x-2">
          {years.map((year) => {
            const isSelected = year === selectedYear;
            const isFuture = year > currentYear;

            return (
              <button
                key={year}
                disabled={isFuture}
                onClick={() => {
                  onDateChange(new Date(year, 0, 1));
                  setShowPicker(false);
                }}
                className={`py-2.5 rounded-xl text-[15px] font-medium transition-all ${
                  isSelected
                    ? 'bg-[#33302E] dark:bg-black-600 text-white shadow-md'
                    : 'text-gray-400 dark:text-gray-300 hover:text-black-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-black-700'
                } ${isFuture ? 'opacity-10 cursor-not-allowed' : ''}`}
              >
                {year + yearOffset}
              </button>
            );
          })}
        </div>
      </>
    );
  };

  const renderWeekPicker = () => {
    const firstOfMonth = new Date(pickerYear, selectedDate.getMonth(), 1);
    const lastOfMonth = new Date(pickerYear, selectedDate.getMonth() + 1, 0);
    const leadingBlanks = (firstOfMonth.getDay() + 6) % 7;
    const totalCells = leadingBlanks + lastOfMonth.getDate();
    const rows = Math.ceil(totalCells / 7);

    const selectedWeekStart = getWeekStart(selectedDate);
    const selectedWeekEnd = getWeekEnd(selectedDate);

    const goToPrevMonth = () => {
      const d = new Date(pickerYear, selectedDate.getMonth() - 1, 1);
      setPickerYear(d.getFullYear());
      onDateChange(d);
    };
    const goToNextMonth = () => {
      const d = new Date(pickerYear, selectedDate.getMonth() + 1, 1);
      if (
        d.getFullYear() > currentYear ||
        (d.getFullYear() === currentYear && d.getMonth() + 1 > currentMonth)
      )
        return;
      setPickerYear(d.getFullYear());
      onDateChange(d);
    };

    const nextMonthDisabled =
      pickerYear > currentYear ||
      (pickerYear === currentYear && selectedDate.getMonth() + 1 >= currentMonth);

    return (
      <>
        <div className="flex justify-between items-center mb-4 px-2">
          <button
            onClick={goToPrevMonth}
            className="p-1 hover:bg-gray-100 dark:hover:bg-black-700 rounded-full transition"
          >
            <IoIosArrowBack size={16} />
          </button>
          <span className="font-bold text-base dark:text-white">
            {monthsThai[selectedDate.getMonth()]} {pickerYear + yearOffset}
          </span>
          <button
            onClick={goToNextMonth}
            disabled={nextMonthDisabled}
            className={`p-1 hover:bg-gray-100 dark:hover:bg-black-700 rounded-full transition ${nextMonthDisabled ? 'invisible' : ''}`}
          >
            <IoIosArrowForward size={16} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekdaysShort.map((w) => (
            <div
              key={w}
              className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-1"
            >
              {w}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: rows * 7 }).map((_, index) => {
            const dayNum = index - leadingBlanks + 1;
            if (dayNum < 1 || dayNum > lastOfMonth.getDate()) {
              return <div key={index} />;
            }
            const cellDate = new Date(pickerYear, selectedDate.getMonth(), dayNum);
            const inSelectedWeek = cellDate >= selectedWeekStart && cellDate <= selectedWeekEnd;
            const isFuture = cellDate > todayMidnight;

            return (
              <button
                key={index}
                disabled={isFuture}
                onClick={() => {
                  onDateChange(cellDate);
                  setShowPicker(false);
                }}
                className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                  inSelectedWeek
                    ? 'bg-[#33302E] dark:bg-black-600 text-white'
                    : 'text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-black-700'
                } ${isFuture ? 'opacity-10 cursor-not-allowed' : ''}`}
              >
                {dayNum}
              </button>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center mb-8 relative">
      <div className="relative mb-3" ref={periodMenuRef}>
        <button
          type="button"
          onClick={() => setShowPeriodMenu((prev) => !prev)}
          className="flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-semibold text-black-900 dark:text-white hover:bg-black-100 dark:hover:bg-black-700 transition"
        >
          <span>{periodOptions.find((option) => option.value === selectedPeriod)?.label}</span>
          <IoChevronDown
            className={`transition-transform duration-200 ${showPeriodMenu ? 'rotate-180' : ''}`}
          />
        </button>

        {showPeriodMenu && (
          <ul className="absolute left-1/2 -translate-x-1/2 mt-1 w-32 bg-white dark:bg-black-800 border border-black-300 dark:border-black-600 rounded-lg shadow-lg z-20 overflow-hidden">
            {periodOptions.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => handleSelectPeriod(option.value)}
                  className={`w-full text-center px-3 py-2 text-sm hover:bg-black-100 dark:hover:bg-black-700 transition ${
                    selectedPeriod === option.value
                      ? 'font-semibold text-blue-600'
                      : 'text-black-800 dark:text-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-center gap-2">
        <button
          onClick={handlePrev}
          className="text-black-900 dark:text-white text-2xl hover:opacity-50 transition"
        >
          <IoIosArrowBack />
        </button>

        <button
          onClick={() => setShowPicker((prev) => !prev)}
          className="border border-black-900 dark:border-white rounded-[8px] min-w-40 px-4 py-1 text-sm font-semibold text-black-900 dark:text-white dark:bg-transparent"
        >
          {getCentralLabel()}
        </button>

        <button
          onClick={handleNext}
          disabled={isNextDisabled()}
          className={`text-black-900 dark:text-white text-2xl transition ${
            isNextDisabled() ? 'opacity-20 cursor-not-allowed' : 'hover:opacity-50'
          }`}
        >
          <IoIosArrowForward />
        </button>
      </div>

      {showPicker && (
        <div
          ref={pickerRef}
          className="absolute top-24 z-50 bg-white dark:bg-black-800 border border-gray-100 dark:border-black-600 shadow-2xl rounded-2xl p-4 w-72 mt-2 animate-in fade-in zoom-in duration-200"
        >
          {selectedPeriod === 'month' && renderMonthPicker()}
          {selectedPeriod === 'year' && renderYearPicker()}
          {selectedPeriod === 'week' && renderWeekPicker()}
        </div>
      )}
    </div>
  );
};

export default HeaderSummary;
