import React, { useEffect, useRef, useState } from 'react';
import Select, { type StylesConfig } from 'react-select';
import { GoCalendar } from 'react-icons/go';
import { RxCross2 } from 'react-icons/rx';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import type { TransactionFormProps, OptionType } from '../../../interface/home';
import SlipPreview from './SlipPreview';
import { useTranslation } from 'react-i18next';

const categorySelectStyles: StylesConfig<OptionType, false> = {
  control: (base, state) => ({
    ...base,
    height: 40,
    minHeight: 40,
    borderRadius: 6,
    borderColor: 'var(--tw-border-opacity, #B1B0AD)',
    backgroundColor: 'inherit',
    cursor: state.isDisabled ? 'not-allowed' : 'default',
  }),
  singleValue: (base) => ({ ...base, color: 'inherit' }),
  menu: (base) => ({ ...base, zIndex: 9999 }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? 'var(--tw-prose-bg, rgba(150,150,150,0.1))' : 'transparent',
    color: 'inherit',
  }),
  indicatorsContainer: (base) => ({ ...base, display: 'none' }),
};

interface TransactionFormWithHeaderProps extends TransactionFormProps {
  onClose: () => void;
  previewUrl: string | null;
  onPreviewClick: () => void;
}

const TransactionForm: React.FC<TransactionFormWithHeaderProps> = ({
  transactionData,
  selectedTypeOption,
  selectedCategoryOption,
  categories,
  onInputChange,
  onSelectChange,
  onDateChange,
  onSave,
  onClose,
  previewUrl,
  onPreviewClick,
}) => {
  const { t, i18n } = useTranslation();
  const transactionTypes = [
    { value: 'INCOME', label: t('income', 'รายรับ') },
    { value: 'EXPENSE', label: t('expense', 'รายจ่าย') },
  ];

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

  const daysThai = [
    t('day_sun_short', 'อา'),
    t('day_mon_short', 'จ'),
    t('day_tue_short', 'อ'),
    t('day_wed_short', 'พ'),
    t('day_thu_short', 'พฤ'),
    t('day_fri_short', 'ศ'),
    t('day_sat_short', 'ส'),
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parsedDate = transactionData.date ? new Date(transactionData.date) : new Date();
  const selectedDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(new Date(selectedDate));
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parsed = transactionData.date ? new Date(transactionData.date) : new Date();
    const validDate = isNaN(parsed.getTime()) ? new Date() : parsed;
    setViewDate(validDate);
  }, [transactionData.date]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showDatePicker &&
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDatePicker]);

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const isFormValid =
    transactionData.description &&
    transactionData.type &&
    transactionData.categoryId &&
    transactionData.amount;

  const formatLocalizedDate = (dateString: string) => {
    if (!dateString) return '';
    const dateObj = new Date(dateString);

    if (isNaN(dateObj.getTime())) return dateString;

    const isThai = i18n.language === 'th';
    const localeStr = isThai ? 'th-TH' : 'en-US';

    let formatted = dateObj.toLocaleDateString(localeStr, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    if (isThai) {
      formatted = formatted
        .replace(t('day_word', 'วัน'), '')
        .replace(t('at_word', 'ที่'), '')
        .replace(t('buddhist_era', 'พ.ศ. '), '');
    }

    return formatted;
  };

  return (
    <div className="py-7 px-8 flex flex-col w-full">
      <div className="flex justify-between items-center mb-5">
        <h4 className="font-medium dark:text-white">{t('edit_transaction', 'แก้ไขรายการ')}</h4>
        <div
          onClick={onClose}
          className="bg-black-300 dark:bg-black-600 flex justify-center items-center rounded-full w-12 h-12 hover:bg-black-400 dark:hover:bg-black-500 cursor-pointer"
        >
          <RxCross2 size={25} />
        </div>
      </div>

      <div className="relative mb-5 w-max">
        <div
          className="flex items-center gap-3 cursor-pointer group dark:text-gray-300"
          onClick={() => setShowDatePicker(!showDatePicker)}
        >
          <GoCalendar
            size={20}
            className="group-hover:text-gray-300 transition-colors dark:text-white"
          />
          <h5 className="text-base group-hover:text-gray-300 transition-colors select-none dark:text-white">
            {formatLocalizedDate(transactionData.date)}
          </h5>
        </div>

        {showDatePicker && (
          <div
            ref={datePickerRef}
            className="absolute top-8 left-0 z-50 bg-white dark:bg-black-800 border border-gray-100 dark:border-black-600 shadow-2xl rounded-2xl p-3 w-64 mt-2 animate-in fade-in zoom-in duration-200"
          >
            <div className="flex justify-between items-center mb-3 px-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 hover:bg-gray-100 dark:hover:bg-black-700 rounded-full transition dark:text-white"
              >
                <IoIosArrowBack size={14} />
              </button>
              <span className="font-bold text-sm dark:text-white">
                {monthsThai[viewDate.getMonth()]}{' '}
                {viewDate.getFullYear() + (i18n.language === 'th' ? 543 : 0)}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 hover:bg-gray-100 dark:hover:bg-black-700 rounded-full transition dark:text-white"
              >
                <IoIosArrowForward size={14} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1.5">
              {daysThai.map((day) => (
                <div
                  key={day}
                  className="text-center text-[11px] text-gray-400 dark:text-gray-500 font-medium"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-0.5 gap-x-0.5">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const currentDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);

                const isSelected =
                  selectedDate.getDate() === day &&
                  selectedDate.getMonth() === viewDate.getMonth() &&
                  selectedDate.getFullYear() === viewDate.getFullYear();

                const isFuture = currentDate > today;

                return (
                  <div key={day} className="flex justify-center items-center">
                    <button
                      type="button"
                      disabled={isFuture}
                      onClick={() => {
                        onDateChange(currentDate);
                        setShowDatePicker(false);
                      }}
                      className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-[#33302E] dark:bg-black-600 text-white shadow-md'
                          : 'text-gray-600 dark:text-gray-300 hover:text-black-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-black-700'
                      } ${isFuture ? 'opacity-20 cursor-not-allowed hover:bg-transparent' : ''}`}
                    >
                      {day}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <label className="dark:text-gray-300">{t('detail_label', 'รายละเอียด')}</label>
          <input
            name="description"
            value={transactionData.description}
            onChange={onInputChange}
            className="border-[1px] text-black-900 dark:text-white bg-transparent dark:bg-black-800 border-black-500 dark:border-black-500 w-full h-10 rounded-md p-1 px-3 focus:outline-none focus:border-sky-700"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="dark:text-gray-300">{t('transaction_type', 'ประเภทรายการ')}</label>
          <Select
            options={transactionTypes}
            value={selectedTypeOption}
            onChange={(option) => onSelectChange('type', option)}
            placeholder=""
            isClearable
            menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
            styles={categorySelectStyles}
            classNames={{
              control: () => 'dark:border-black-500',
              menu: () =>
                'bg-white dark:bg-black-800 border border-gray-100 dark:border-black-600 text-black-900 dark:text-white',
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="dark:text-gray-300">{t('category', 'หมวด')}</label>
          <Select
            options={categories}
            value={selectedCategoryOption}
            onChange={(option) => onSelectChange('categoryId', option)}
            placeholder=""
            isDisabled={!transactionData.type}
            isClearable
            menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
            styles={categorySelectStyles}
            classNames={{
              control: (state) =>
                `!border-[1px] !border-black-500 dark:!border-black-500 text-black-900 dark:text-white transition-all
    ${
      state.isDisabled
        ? '!bg-gray-200 dark:!bg-black-700 !cursor-not-allowed opacity-60'
        : '!bg-white dark:!bg-black-800 !cursor-pointer'
    }`,
              menu: () => 'bg-white dark:bg-black-800 border border-gray-100 dark:border-black-600',
              placeholder: () => 'text-gray-400 dark:text-gray-50',
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="dark:text-gray-300">{t('amount_label', 'จำนวนเงิน')}</label>
          <input
            name="amount"
            type="number"
            value={transactionData.amount}
            onChange={onInputChange}
            className="border-[1px] text-black-900 dark:text-white bg-transparent dark:bg-black-800 border-black-500 dark:border-black-500 w-full h-10 rounded-md p-1 px-3 focus:outline-none focus:border-sky-700"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="dark:text-gray-300">{t('slip_info', 'ข้อมูลสลิป')}</label>
          <SlipPreview
            transactionData={transactionData}
            previewUrl={previewUrl}
            onPreviewClick={onPreviewClick}
          />
        </div>

        <div className="flex justify-center items-center">
          <button
            onClick={onSave}
            disabled={!isFormValid}
            className={`${
              isFormValid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
            } w-full px-6 py-3 rounded-xl text-white text-sm font-semibold transition-colors`}
          >
            {t('save_btn', 'บันทึก')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionForm;
