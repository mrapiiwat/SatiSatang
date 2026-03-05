import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { GoCalendar } from 'react-icons/go';
import { RxCross2 } from 'react-icons/rx';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import type { SingleValue } from 'react-select';
import Select from 'react-select';
import axios from '../../../api/axios';
import type {
  CategoryOption,
  CategoryResponse,
  ManualProps,
  OptionType,
} from '../../../interface/home';
import { showToastAlert } from '../../../store/toastStore';
import type { ElysiaResponse } from '../../../interface/error';
import { isAxiosError, type AxiosError } from 'axios';

const options: OptionType[] = [
  { value: 'INCOME', label: 'รายรับ' },
  { value: 'EXPENSE', label: 'รายจ่าย' },
];

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

const daysThai = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

const Manual: React.FC<ManualProps> = ({ onClose, onSuccess, editData, onUpdateDraft }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    return editData && 'date' in editData ? new Date(editData.date as string) : new Date();
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [viewDate, setViewDate] = useState<Date>(new Date(selectedDate));

  const datePickerRef = useRef<HTMLDivElement>(null);

  const formattedDate = selectedDate
    .toLocaleDateString('th-TH', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    .replace('วัน', '')
    .replace('ที่', '')
    .replace('พ.ศ. ', '');

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

  const [selectedType, setSelectedType] = useState<OptionType | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption | null>(null);
  const [detail, setDetail] = useState('');
  const [amount, setAmount] = useState('');
  const [pendingAutoSelectId, setPendingAutoSelectId] = useState<number | null>(null);

  const pendingAutoSelectIdRef = useRef(pendingAutoSelectId);
  const selectedTypeRef = useRef(selectedType);

  useEffect(() => {
    pendingAutoSelectIdRef.current = pendingAutoSelectId;
  }, [pendingAutoSelectId]);
  useEffect(() => {
    selectedTypeRef.current = selectedType;
  }, [selectedType]);

  useEffect(() => {
    if (editData) {
      setDetail(editData.description || '');
      setAmount(editData.amount.toString());
      const typeOption = options.find((opt) => opt.value === editData.type);
      if (typeOption) setSelectedType(typeOption);

      if ('date' in editData && editData.date) {
        const d = new Date(editData.date as string);
        setSelectedDate(d);
        setViewDate(d);
      }
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
        const isCreateMode = !editData || !('id' in editData);
        const goalQuery = isCreateMode ? '&includeGoals=true' : '';
        const res = await axios.get(`/categories?type=${selectedType.value}${goalQuery}`);
        const data: CategoryResponse[] = res.data.data;
        const formatted: CategoryOption[] = data.map((cat) => ({
          value: cat.id,
          label: cat.name,
          isGoal: cat.isGoal || false,
        }));
        setCategories(formatted);
        const isPending = pendingAutoSelectIdRef.current;
        if (editData && editData.type === selectedType.value && !isPending) {
          const currentCat = formatted.find((cat) => cat.value === editData.categoryId);
          if (currentCat) setSelectedCategory(currentCat);
        } else if (!isPending) {
          setSelectedCategory(null);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, [selectedType, editData]);

  useEffect(() => {
    if (pendingAutoSelectId && categories.length > 0) {
      const targetCat = categories.find((c) => c.value === pendingAutoSelectId);
      if (targetCat) {
        setSelectedCategory(targetCat);
        setPendingAutoSelectId(null);
      }
    }
  }, [categories, pendingAutoSelectId]);

  useEffect(() => {
    if (editData || !detail) return;
    const timeoutId = setTimeout(async () => {
      try {
        const res = await axios.post('/transaction/predict-category', { description: detail });
        const { categoryId, type } = res.data;
        if (categoryId && type) {
          if (selectedTypeRef.current?.value !== type) {
            const newTypeOption = options.find((o) => o.value === type);
            if (newTypeOption) setSelectedType(newTypeOption);
          }
          setPendingAutoSelectId(categoryId);
        }
      } catch (err) {
        console.error('Error predicting category:', err);
      }
    }, 800);
    return () => clearTimeout(timeoutId);
  }, [detail, editData]);

  const isModified = () => {
    if (!editData || !('id' in editData)) return true;
    const isTypeChanged = selectedType?.value !== editData.type;
    const isCategoryChanged = selectedCategory?.value !== editData.categoryId;
    const isDetailChanged = detail !== (editData.description || '');
    const isAmountChanged = Number(amount) !== Number(editData.amount);
    const oldDate = editData.date ? new Date(editData.date as string) : new Date();
    const isDateChanged = selectedDate.toDateString() !== oldDate.toDateString();

    return (
      isTypeChanged || isCategoryChanged || isDetailChanged || isAmountChanged || isDateChanged
    );
  };

  const canSubmit = isModified();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !selectedCategory || !amount || !detail) {
      return showToastAlert('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
    }
    if (Number(amount) < 0) {
      return showToastAlert('จำนวนเงินต้องมากกว่า 0', 'error');
    }
    const offsetDate = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000);
    const payload = {
      type: selectedType.value as 'INCOME' | 'EXPENSE',
      description: detail,
      categoryId: selectedCategory.value,
      amount: Number(amount),
      isGoal: selectedCategory.isGoal || false,
      date: offsetDate.toISOString(),
    };

    if (onUpdateDraft) {
      onUpdateDraft(payload);
      onClose();
      return;
    }

    try {
      if (editData && 'id' in editData) {
        await axios.put(`/transaction/${editData.id}`, payload);
        showToastAlert('แก้ไขข้อมูลสำเร็จ', 'success');
      } else {
        await axios.post('/transaction', payload);
        showToastAlert('บันทึกสำเร็จ', 'success');
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const axiosError = err as AxiosError<ElysiaResponse>;
        const data = axiosError.response?.data;
        const customError = data?.errors?.find((e) => e.schema?.error)?.schema?.error;
        const msg = customError || data?.errors?.[0]?.summary || data?.message || 'เกิดข้อผิดพลาด';
        showToastAlert(msg, 'error');
      } else {
        showToastAlert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดไม่ทราบชนิด', 'error');
      }
    }
  };

  return (
    <div className="flex justify-center items-center" onClick={(e) => e.stopPropagation()}>
      <div className="bg-white w-full max-w-96 min-h-[530px] rounded-2xl py-7 px-8 relative">
        <div className="flex justify-between items-center mb-5">
          <h4 className="font-medium">
            {editData && 'id' in editData ? 'แก้ไขรายการ' : 'บันทึกรายรับรายจ่าย'}
          </h4>
          <div
            onClick={onClose}
            className="bg-black-300 flex justify-center items-center rounded-full w-12 h-12 hover:bg-black-400 cursor-pointer"
          >
            <RxCross2 size={25} />
          </div>
        </div>

        <div className="relative mb-5 w-max">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setShowDatePicker(!showDatePicker)}
          >
            <GoCalendar size={20} className="group-hover:text-blue-600 transition-colors" />
            <h5 className="text-base group-hover:text-blue-600 transition-colors select-none">
              {formattedDate}
            </h5>
          </div>

          {showDatePicker && (
            <div
              ref={datePickerRef}
              className="absolute top-8 left-0 z-50 bg-white border border-gray-100 shadow-2xl rounded-2xl p-3 w-64 mt-2 animate-in fade-in zoom-in duration-200"
            >
              <div className="flex justify-between items-center mb-3 px-1">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 hover:bg-gray-100 rounded-full transition"
                >
                  <IoIosArrowBack size={14} />
                </button>
                <span className="font-bold text-sm">
                  {monthsThai[viewDate.getMonth()]} {viewDate.getFullYear() + 543}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-gray-100 rounded-full transition"
                >
                  <IoIosArrowForward size={14} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-1.5">
                {daysThai.map((day) => (
                  <div key={day} className="text-center text-[11px] text-gray-400 font-medium">
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
                          setSelectedDate(currentDate);
                          setShowDatePicker(false);
                        }}
                        className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-[#33302E] text-white shadow-md'
                            : 'text-gray-600 hover:text-black-900 hover:bg-gray-100'
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
            <button
              disabled={!canSubmit}
              className={`${
                canSubmit ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
              } w-full px-6 py-3 rounded-xl text-white text-sm font-semibold transition-colors`}
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Manual;
