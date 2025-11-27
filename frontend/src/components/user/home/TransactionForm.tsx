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
  formattedDate,
  onInputChange,
  onSelectChange,
  onSave,
  onClose,
  previewUrl,
  onPreviewClick,
}) => (
  <div>
    <div className="pt-7 px-6 flex justify-between items-center">
      <h4 className="text-lg font-medium">แก้ไขรายการรายรับรายจ่าย</h4>
      <div
        onClick={onClose}
        className="bg-black-300 flex justify-center items-center rounded-full w-12 h-12 hover:bg-black-400 cursor-pointer"
      >
        <RxCross2 size={25} />
      </div>
    </div>

    <div className="px-6 py-5 space-y-4">
      <div className="flex items-center gap-3 mb-5">
        <GoCalendar size={20} />
        <h5 className="text-base">{formattedDate}</h5>
      </div>

      <div>
        <label className="text-gray-700 mb-1.5 block">รายละเอียด</label>
        <input
          name="description"
          value={transactionData.description}
          onChange={onInputChange}
          className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="text-gray-700 mb-1.5 block">ประเภทรายการ</label>
        <Select
          options={transactionTypes}
          value={selectedTypeOption}
          onChange={(option) => onSelectChange('type', option)}
          placeholder=""
          isClearable
          styles={categorySelectStyles}
        />
      </div>

      <div>
        <label className="text-gray-700 mb-1.5 block">หมวด</label>
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

      <div>
        <label className="text-gray-700 mb-1.5 block">จำนวนเงิน</label>
        <input
          name="amount"
          type="number"
          value={transactionData.amount}
          onChange={onInputChange}
          className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="text-gray-700 my-3 font-medium block">ข้อมูลสลิป</label>
        <SlipPreview
          transactionData={transactionData}
          previewUrl={previewUrl}
          onPreviewClick={onPreviewClick}
        />
      </div>
      <button
        onClick={onSave}
        disabled={
          !transactionData.description ||
          !transactionData.type ||
          !transactionData.categoryId ||
          !transactionData.amount
        }
        className={`w-full py-2.5 rounded-xl font-semibold text-white transition ${
          transactionData.description &&
          transactionData.type &&
          transactionData.categoryId &&
          transactionData.amount
            ? 'bg-blue-600 hover:bg-blue-700'
            : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        บันทึก
      </button>
    </div>
  </div>
);

export default TransactionForm;
