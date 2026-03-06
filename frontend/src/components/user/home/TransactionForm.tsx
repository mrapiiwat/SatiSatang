import React from 'react';
import Select, { type StylesConfig } from 'react-select';
import { GoCalendar } from 'react-icons/go';
import { RxCross2 } from 'react-icons/rx';
import type { TransactionFormProps, OptionType } from '../../../interface/home';
import SlipPreview from './SlipPreview';

const categorySelectStyles: StylesConfig<OptionType, false> = {
  control: (base, state) => ({
    ...base,
    height: 40,
    minHeight: 40,
    borderRadius: 6,
    borderColor: '#B1B0AD',
    backgroundColor: state.isDisabled ? '#F3F4F6' : 'white',
    cursor: state.isDisabled ? 'not-allowed' : 'default',
  }),
  singleValue: (base) => ({ ...base, color: '#111827' }),
  indicatorsContainer: (base) => ({ ...base, display: 'none' }),
};

const transactionTypes = [
  { value: 'INCOME', label: 'รายรับ' },
  { value: 'EXPENSE', label: 'รายจ่าย' },
];

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
  const isFormValid =
    transactionData.description &&
    transactionData.type &&
    transactionData.categoryId &&
    transactionData.amount;

  const formatThaiDate = (dateString: string) => {
    if (!dateString) return '';
    const dateObj = new Date(dateString);

    if (isNaN(dateObj.getTime())) return dateString;

    return dateObj
      .toLocaleDateString('th-TH', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
      .replace('วัน', '')
      .replace('ที่', '')
      .replace('พ.ศ. ', '');
  };

  return (
    <div className="py-7 px-8 flex flex-col w-full">
      <div className="flex justify-between items-center mb-5">
        <h4 className="font-medium">แก้ไขรายการ</h4>
        <div
          onClick={onClose}
          className="bg-black-300 flex justify-center items-center rounded-full w-12 h-12 hover:bg-black-400 cursor-pointer"
        >
          <RxCross2 size={25} />
        </div>
      </div>

      <div className="flex items-center gap-3 mb-5 w-max">
        <GoCalendar size={20} />
        <h5 className="text-base select-none">{formatThaiDate(transactionData.date)}</h5>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <label>รายละเอียด</label>
          <input
            name="description"
            value={transactionData.description}
            onChange={onInputChange}
            className="border-[1px] text-black-900 border-black-500 w-full h-10 rounded-md p-1 px-3 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label>ประเภทรายการ</label>
          <Select
            options={transactionTypes}
            value={selectedTypeOption}
            onChange={(option) => onSelectChange('type', option)}
            placeholder=""
            isClearable
            styles={categorySelectStyles}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label>หมวด</label>
          <Select
            options={categories}
            value={selectedCategoryOption}
            onChange={(option) => onSelectChange('categoryId', option)}
            placeholder=""
            isDisabled={!transactionData.type}
            isClearable
            styles={categorySelectStyles}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label>จำนวนเงิน</label>
          <input
            name="amount"
            type="number"
            value={transactionData.amount}
            onChange={onInputChange}
            className="border-[1px] text-black-900 border-black-500 w-full h-10 rounded-md p-1 px-3 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label>ข้อมูลสลิป</label>
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
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionForm;
