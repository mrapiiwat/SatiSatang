import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import type { SingleValue } from 'react-select';
import { RxCross2 } from 'react-icons/rx';
import { GoCalendar } from 'react-icons/go';
import type {
  ManualProps,
  OptionType,
  CategoryOption,
  CategoryResponse,
} from '../../../interface/home';
import axios from '../../../api/axios';
import { showToastAlert } from '../../../store/toastStore';

const options: OptionType[] = [
  { value: 'INCOME', label: 'รายรับ' },
  { value: 'EXPENSE', label: 'รายจ่าย' },
];

const Manual: React.FC<ManualProps> = ({ onClose, onSuccess, editData }) => {
  const today = new Date();
  const displayDate = editData ? new Date(editData.createdAt) : today;
  const formattedDate = displayDate
    .toLocaleDateString('th-TH', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    .replace('วัน', '')
    .replace('ที่', '')
    .replace('พ.ศ. ', '');

  const [selectedType, setSelectedType] = useState<OptionType | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption | null>(null);
  const [detail, setDetail] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (editData) {
      setDetail(editData.description || '');
      setAmount(editData.amount.toString());
      const typeOption = options.find((opt) => opt.value === editData.type);
      if (typeOption) setSelectedType(typeOption);
    }
  }, [editData]);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!selectedType) {
        setCategories([]);
        setSelectedCategory(null);
        return;
      }

      try {
        const isCreateMode = !editData;
        const goalQuery = isCreateMode ? '&includeGoals=true' : '';

        const res = await axios.get(`/categories?type=${selectedType.value}${goalQuery}`);
        const data: CategoryResponse[] = res.data.data;

        const formatted: CategoryOption[] = data.map((cat) => ({
          value: cat.id,
          label: cat.name,
          isGoal: cat.isGoal || false,
        }));

        setCategories(formatted);

        if (editData && editData.type === selectedType.value) {
          const currentCat = formatted.find((cat) => cat.value === editData.categoryId);
          if (currentCat) setSelectedCategory(currentCat);
        } else {
          setSelectedCategory(null);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, [selectedType, editData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedType || !selectedCategory || !amount || !detail) {
      return showToastAlert('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
    }

    if (Number(amount) < 0) {
      return showToastAlert('จำนวนเงินต้องมากกว่า 0', 'error');
    }

    try {
      const payload = {
        type: selectedType.value,
        description: detail,
        categoryId: selectedCategory.value,
        amount: Number(amount),
        isGoal: selectedCategory.isGoal || false,
      };

      if (editData) {
        await axios.put(`/transaction/${editData.id}`, payload);
        showToastAlert('แก้ไขข้อมูลสำเร็จ', 'success');
      } else {
        await axios.post('/transaction', payload);
        showToastAlert('บันทึกสำเร็จ', 'success');
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      showToastAlert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดไม่ทราบชนิด', 'error');
    }
  };

  return (
    <div className="flex justify-center items-center">
      <div className="bg-white w-full max-w-96 min-h-[530px] rounded-2xl py-7 px-8">
        <div className="flex justify-between items-center mb-5">
          <h4 className="font-medium">{editData ? 'แก้ไขรายการ' : 'บันทึกรายรับรายจ่าย'}</h4>
          <div
            onClick={onClose}
            className="bg-black-300 flex justify-center items-center rounded-full w-12 h-12 hover:bg-black-400 cursor-pointer"
          >
            <RxCross2 size={25} />
          </div>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <GoCalendar size={20} />
          <h5 className="text-base">{formattedDate}</h5>
        </div>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label htmlFor="detail">รายละเอียด</label>
            <input
              id="detail"
              type="text"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              className="border-[1px] text-black-900 border-black-500 w-full h-10 rounded-md p-1 px-3"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label>ประเภทรายการ</label>
            <Select<OptionType, false>
              options={options}
              value={selectedType}
              onChange={(option: SingleValue<OptionType>) => setSelectedType(option)}
              placeholder=""
              isClearable
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
            <label>หมวด</label>
            <Select<CategoryOption, false>
              options={categories}
              value={selectedCategory}
              onChange={(option: SingleValue<CategoryOption>) => setSelectedCategory(option)}
              placeholder=""
              isDisabled={!selectedType}
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
              onChange={(e) => setAmount(e.target.value)}
              className="border-[1px] text-black-900 border-black-500 w-full h-10 rounded-md p-1 px-3"
            />
          </div>

          <div className="flex justify-center items-center mt-3">
            <button className="bg-blue-600 px-6 py-3 rounded-xl text-white text-sm font-semibold">
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Manual;
