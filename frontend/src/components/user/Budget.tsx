import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import type { SingleValue } from 'react-select';
import { RxCross2 } from 'react-icons/rx';
import axios from '../../api/axios';
import { isAxiosError } from 'axios';
import { IoChevronDownSharp } from 'react-icons/io5';
import type {
  CategoryResponse,
  FrequencyOption,
  CategoryOption,
  BudgetProps,
} from '../../types/home';

const frequencies: FrequencyOption[] = [
  { value: 'DAILY', label: 'รายวัน' },
  { value: 'WEEKLY', label: 'รายสัปดาห์' },
  { value: 'MONTHLY', label: 'รายเดือน' },
  { value: 'YEARLY', label: 'รายปี' },
];

const Budget: React.FC<BudgetProps> = ({ onClose, onSuccess }) => {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption | null>(null);
  const [selectedFrequency, setSelectedFrequency] = useState<FrequencyOption | null>(null);
  const [amount, setAmount] = useState('');

  const [errors, setErrors] = useState({
    category: false,
    frequency: false,
    amount: false,
  });

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
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      category: !selectedCategory,
      frequency: !selectedFrequency,
      amount: !amount,
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    try {
      await axios.post('/budget', {
        categoryId: selectedCategory!.value,
        frequency: selectedFrequency!.value,
        amount: Number(amount),
      });

      alert('ตั้งงบประมาณสำเร็จ');
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        alert(err.response?.data?.message || 'เกิดข้อผิดพลาด');
      } else if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('เกิดข้อผิดพลาดไม่ทราบชนิด');
      }
      console.error(err);
    }
  };

  return (
    <div className="flex justify-center items-center px-6">
      <div className="bg-white w-full max-w-96 min-h-[420px] rounded-2xl py-7 px-8">
        <div className="flex justify-between items-center mb-5">
          <h4 className="font-medium">ตั้งงบประมาณ</h4>
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
                if (option) setErrors((prev) => ({ ...prev, category: false }));
              }}
              placeholder="กรุณาเลือกหมวด"
              components={{
                IndicatorSeparator: () => null,
                DropdownIndicator: () => (
                  <div style={{ display: 'flex', alignItems: 'center', paddingRight: 8 }}>
                    <IoChevronDownSharp size={18} />
                  </div>
                ),
              }}
              styles={{
                control: (base, state) => ({
                  ...base,
                  height: 40,
                  minHeight: 40,
                  borderRadius: 6,
                  borderColor: errors.category
                    ? '#FF383C'
                    : state.isFocused
                      ? '#3B82F6'
                      : '#B1B0AD',
                  '&:hover': {
                    borderColor: errors.category ? '#FF383C' : '#B1B0AD',
                  },
                  boxShadow: undefined,
                }),
                singleValue: (base) => ({ ...base, color: '#111827' }),
              }}
            />
            {errors.category && (
              <p className="text-sm text-[#FF383C] mt-1">กรุณากรอกข้อมูลให้ครบถ้วน</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label>รอบงบประมาณ</label>
            <Select<FrequencyOption, false>
              options={frequencies}
              value={selectedFrequency}
              onChange={(option: SingleValue<FrequencyOption>) => {
                setSelectedFrequency(option);
                if (option) setErrors((prev) => ({ ...prev, frequency: false }));
              }}
              placeholder="กรุณาเลือกรอบงบประมาณ"
              components={{
                IndicatorSeparator: () => null,
                DropdownIndicator: () => (
                  <div style={{ display: 'flex', alignItems: 'center', paddingRight: 8 }}>
                    <IoChevronDownSharp size={18} />
                  </div>
                ),
              }}
              styles={{
                control: (base, state) => ({
                  ...base,
                  height: 40,
                  minHeight: 40,
                  borderRadius: 6,
                  borderColor: errors.frequency
                    ? '#FF383C'
                    : state.isFocused
                      ? '#3B82F6'
                      : '#B1B0AD',
                  '&:hover': {
                    borderColor: errors.frequency ? '#FF383C' : '#B1B0AD',
                  },
                  boxShadow: undefined,
                }),
                singleValue: (base) => ({ ...base, color: '#111827' }),
              }}
            />
            {errors.frequency && (
              <p className="text-sm text-[#FF383C] mt-1">กรุณากรอกข้อมูลให้ครบถ้วน</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="amount">จำนวนเงิน</label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (e.target.value) setErrors((prev) => ({ ...prev, amount: false }));
              }}
              placeholder="เช่น 3,000"
              className={`text-black-900 w-full h-10 rounded-md p-1 px-3 focus:outline-none transition ${
                errors.amount
                  ? 'border-[1px] border-[#FF383C]'
                  : 'border-[1px] border-black-500 focus:border-blue-600 focus:ring-0'
              }`}
            />
            {errors.amount && (
              <p className="text-sm text-[#FF383C] mt-1">กรุณากรอกข้อมูลให้ครบถ้วน</p>
            )}
          </div>

          <div className="flex justify-center items-center mt-3">
            <button
              type="submit"
              className="bg-blue-600 px-6 py-3 rounded-xl text-white text-sm font-semibold hover:bg-blue-700 transition"
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
