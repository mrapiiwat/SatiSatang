import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import type { SingleValue } from 'react-select';
import { RxCross2 } from 'react-icons/rx';
import axios from '../../../api/axios';
import { AxiosError, isAxiosError } from 'axios';
import { IoChevronDownSharp } from 'react-icons/io5';
import type {
  CategoryResponse,
  FrequencyOption,
  CategoryOption,
  BudgetProps,
  BudgetDraftData,
} from '../../../interface/home';
import { showToastAlert } from '../../../store/toastStore';
import type { ElysiaResponse } from '../../../interface/error';
import Tooltip from '../../Tooltip';

const frequencies: FrequencyOption[] = [
  { value: 'DAILY', label: 'รายวัน' },
  { value: 'WEEKLY', label: 'รายสัปดาห์' },
  { value: 'MONTHLY', label: 'รายเดือน' },
  { value: 'YEARLY', label: 'รายปี' },
];

interface ExtendedBudgetProps extends BudgetProps {
  editData?: BudgetDraftData | null;
  onUpdateDraft?: (data: BudgetDraftData) => void;
}

const Budget: React.FC<ExtendedBudgetProps> = ({ onClose, onSuccess, editData, onUpdateDraft }) => {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption | null>(null);
  const [selectedFrequency, setSelectedFrequency] = useState<FrequencyOption | null>(null);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/categories?type=EXPENSE');
        const data = res.data.data;
        const formatted = data.map((cat: CategoryResponse) => ({
          value: cat.id,
          label: cat.name,
        }));
        setCategories(formatted);

        if (editData) {
          const foundCat = formatted.find((c: CategoryOption) => c.value === editData.categoryId);
          if (foundCat) setSelectedCategory(foundCat);

          const foundFreq = frequencies.find((f) => f.value === editData.frequency);
          if (foundFreq) setSelectedFrequency(foundFreq);

          setAmount(editData.amount.toString());
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, [editData]);

  const isModified = () => {
    if (!editData) return true;

    const currentAmount = amount === '' ? 0 : Number(amount);
    const originalAmount = Number(editData.amount);

    const isCategoryChanged = selectedCategory?.value !== editData.categoryId;
    const isFrequencyChanged = selectedFrequency?.value !== editData.frequency;
    const isAmountChanged = currentAmount !== originalAmount;

    return isCategoryChanged || isFrequencyChanged || isAmountChanged;
  };

  const canSubmit = isModified();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      category: !selectedCategory,
      frequency: !selectedFrequency,
      amount: !amount,
    };

    if (Object.values(newErrors).some(Boolean)) {
      return showToastAlert('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
    }

    const payload = {
      categoryId: selectedCategory!.value,
      frequency: selectedFrequency!.value,
      amount: Number(amount),
    };

    if (onUpdateDraft) {
      onUpdateDraft(payload);
      onClose();
      return;
    }

    try {
      if (editData) {
        await axios.put(`/budget/${editData.id}`, payload);
        showToastAlert('แก้ไขงบประมาณสำเร็จ', 'success');
      } else {
        await axios.post('/budget', payload);
        showToastAlert('ตั้งงบประมาณสำเร็จ', 'success');
      }

      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const axiosError = err as AxiosError<ElysiaResponse>;
        const data = axiosError.response?.data;
        const customError = data?.errors?.find((e) => e.schema?.error)?.schema?.error;
        const errorMessage =
          customError || data?.errors?.[0]?.summary || data?.message || 'เกิดข้อผิดพลาด';
        showToastAlert(errorMessage, 'error');
      } else if (err instanceof Error) {
        showToastAlert(`${err.message}`, 'error');
      } else {
        showToastAlert('เกิดข้อผิดพลาดไม่ทราบชนิด', 'error');
      }
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!editData) return;

    try {
      await axios.delete(`/budget/${editData.id}`);

      showToastAlert('ลบงบประมาณสำเร็จ', 'success');

      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const axiosError = err as AxiosError<ElysiaResponse>;
        const data = axiosError.response?.data;
        const errorMessage = data?.message || 'เกิดข้อผิดพลาด';
        showToastAlert(errorMessage, 'error');
      } else if (err instanceof Error) {
        showToastAlert(`${err.message}`, 'error');
      } else {
        showToastAlert('เกิดข้อผิดพลาดไม่ทราบชนิด', 'error');
      }
      console.error(err);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <div className="bg-white w-full max-w-96 min-h-[420px] rounded-2xl py-7 px-8">
        <div className="flex justify-between items-center mb-5">
          <div className="flex gap-3 items-center">
            <h4 className="font-medium">{editData ? 'แก้ไขงบประมาณ' : 'ตั้งงบประมาณ'}</h4>
            <Tooltip text="กําหนดงบประมาณเพื่อควบคุมและจำกัดค่าใช้จ่าย" position="right" />
          </div>
          <div
            onClick={onClose}
            className="bg-black-300 flex justify-center items-center rounded-full w-12 h-12 hover:bg-black-400 cursor-pointer"
          >
            <RxCross2 size={25} />
          </div>
        </div>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label>หมวด</label>
            <Select<CategoryOption, false>
              options={categories}
              value={selectedCategory}
              onChange={(option: SingleValue<CategoryOption>) => {
                setSelectedCategory(option);
              }}
              placeholder=""
              components={{
                IndicatorSeparator: () => null,
                DropdownIndicator: () => (
                  <div style={{ display: 'flex', alignItems: 'center', paddingRight: 8 }}>
                    <IoChevronDownSharp size={18} />
                  </div>
                ),
              }}
              styles={{
                control: (base) => ({
                  ...base,
                  height: 40,
                  minHeight: 40,
                  borderRadius: 6,
                  borderColor: '#B1B0AD',
                }),
                singleValue: (base) => ({ ...base, color: '#111827' }),
                indicatorsContainer: (base) => ({ ...base, display: 'none' }),
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label>รอบงบประมาณ</label>
            <Select<FrequencyOption, false>
              options={frequencies}
              value={selectedFrequency}
              onChange={(option: SingleValue<FrequencyOption>) => {
                setSelectedFrequency(option);
              }}
              placeholder=""
              components={{
                IndicatorSeparator: () => null,
                DropdownIndicator: () => (
                  <div style={{ display: 'flex', alignItems: 'center', paddingRight: 8 }}>
                    <IoChevronDownSharp size={18} />
                  </div>
                ),
              }}
              styles={{
                control: (base) => ({
                  ...base,
                  height: 40,
                  minHeight: 40,
                  borderRadius: 6,
                  borderColor: '#B1B0AD',
                }),
                singleValue: (base) => ({ ...base, color: '#111827' }),
                indicatorsContainer: (base) => ({ ...base, display: 'none' }),
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="amount">จำนวนเงิน</label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
              }}
              className="text-black-900 w-full h-10 rounded-md p-1 px-3 focus:outline-none transition border-[1px] border-black-500 focus:border-sky-700 focus:ring-0"
            />
          </div>

          <div className="flex items-center gap-3 mt-4">
            {editData && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 py-3 rounded-xl bg-[#FF2D55] text-white text-sm font-semibold hover:bg-[#f91e46] transition"
              >
                ลบ
              </button>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className={`flex-1 py-3 rounded-xl text-white text-sm font-semibold transition ${
                canSubmit ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Budget;
