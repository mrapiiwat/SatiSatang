import React from 'react';
import Select, { type StylesConfig } from 'react-select';
import { GoCalendar } from 'react-icons/go';
import { RxCross2 } from 'react-icons/rx';
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

      <div className="flex items-center gap-3 mb-5 w-max dark:text-gray-300">
        <GoCalendar size={20} />
        <h5 className="text-base select-none">{formatLocalizedDate(transactionData.date)}</h5>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <label className="dark:text-gray-300">{t('detail_label', 'รายละเอียด')}</label>
          <input
            name="description"
            value={transactionData.description}
            onChange={onInputChange}
            className="border-[1px] text-black-900 dark:text-white dark:bg-black-700 border-black-500 dark:border-black-500 w-full h-10 rounded-md p-1 px-3 focus:outline-none"
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
              control: () => 'dark:border-black-500 dark:bg-black-700',
              menu: () =>
                'bg-white dark:bg-black-800 border border-gray-100 dark:border-black-600 text-black-900 dark:text-white',
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
            className="border-[1px] text-black-900 dark:text-white dark:bg-black-700 border-black-500 dark:border-black-500 w-full h-10 rounded-md p-1 px-3 focus:outline-none"
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
