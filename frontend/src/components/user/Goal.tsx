import React, { useState } from 'react';
import { RxCross2 } from 'react-icons/rx';
import Select from 'react-select';
import type { SingleValue } from 'react-select';
import type { GoalProps, OptionType } from '../../types/home';
import axios from '../../api/axios';
import { isAxiosError } from 'axios';
import { showToastAlert } from '../../store/toastStore';

const Goal: React.FC<GoalProps> = ({ onClose }) => {
  const [goalName, setGoalName] = useState('');
  const [amount, setAmount] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState<SingleValue<OptionType>>(null);
  const [day, setDay] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const monthOptions: OptionType[] = [
    { value: '1', label: 'มกราคม' },
    { value: '2', label: 'กุมภาพันธ์' },
    { value: '3', label: 'มีนาคม' },
    { value: '4', label: 'เมษายน' },
    { value: '5', label: 'พฤษภาคม' },
    { value: '6', label: 'มิถุนายน' },
    { value: '7', label: 'กรกฎาคม' },
    { value: '8', label: 'สิงหาคม' },
    { value: '9', label: 'กันยายน' },
    { value: '10', label: 'ตุลาคม' },
    { value: '11', label: 'พฤศจิกายน' },
    { value: '12', label: 'ธันวาคม' },
  ];

  const validateInputs = () => {
    const newErrors: Record<string, string> = {};

    if (!goalName.trim()) newErrors.goalName = 'กรุณากรอกชื่อเป้าหมาย';
    if (!amount.trim() || parseFloat(amount) <= 0) newErrors.amount = 'จำนวนเงินต้องมากกว่า 0';

    if (month && (Number(month.value) < 1 || Number(month.value) > 12))
      newErrors.month = 'เดือนต้องอยู่ระหว่าง 1 - 12';
    if (day && (Number(day) < 1 || Number(day) > 31)) newErrors.day = 'วันต้องอยู่ระหว่าง 1 - 31';

    if (year && month && day) {
      const selectedDate = new Date(Number(year), Number(month.value) - 1, Number(day));
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.deadline = 'ตั้งเป้าหมายวันในอนาคตกันเถอะ!';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    if (value.length > 4) return;

    if (Number(value) >= 2500) {
      value = String(Number(value) - 543);
    }

    setYear(value);
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (Number(value) < 0 || Number(value) > 31) return;

    if (month && value) {
      const selectedMonth = Number(month.value);
      const selectedYear = year ? Number(year) : new Date().getFullYear();
      let maxDays = 31;

      if ([4, 6, 9, 11].includes(selectedMonth)) {
        maxDays = 30;
      }
      // เดือนกุมภาพันธ์
      else if (selectedMonth === 2) {
        const isLeapYear =
          (selectedYear % 4 === 0 && selectedYear % 100 !== 0) || selectedYear % 400 === 0;
        maxDays = isLeapYear ? 29 : 28;
      }

      if (Number(value) > maxDays) return;
    }

    setDay(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    try {
      const deadline =
        year && month && day
          ? `${year}-${month.value.padStart(2, '0')}-${day.padStart(2, '0')}`
          : null;
      await axios.post('/goal', {
        name: goalName,
        amount: Number(amount),
        deadline: deadline,
      });

      await showToastAlert('บันทึกสำเร็จ', 'success');
      onClose();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        showToastAlert(`${err.response?.data?.message || 'เกิดข้อผิดพลาด'}`, 'error');
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
      <div className="bg-white w-full max-w-96 rounded-2xl py-7 px-8">
        <div className="flex justify-between items-center mb-6">
          <h4 className="font-semibold">เป้าหมาย</h4>
          <div
            onClick={onClose}
            className="bg-black-300 flex justify-center items-center rounded-full w-12 h-12 hover:bg-black-400 cursor-pointer"
          >
            <RxCross2 size={25} />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">ชื่อเป้าหมาย</label>
            <input
              type="text"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              placeholder="เช่น iPhone 17"
              className={`border ${
                errors.goalName ? 'border-red-500' : 'border-black-500'
              } w-full h-10 rounded-md px-3 text-black-900 focus:border-blue-600 focus:outline-none`}
            />
            {errors.goalName && <p className="text-red-500 text-xs mt-1">{errors.goalName}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">จำนวนเงิน</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="เช่น 29,900"
              className={`border ${
                errors.amount ? 'border-red-500' : 'border-black-500'
              } w-full h-10 rounded-md px-3 text-black-900 focus:border-blue-600 focus:outline-none`}
            />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">ระยะเวลา</label>
            <div className="flex gap-2">
              <div className="flex flex-col flex-1 min-w-0">
                <input
                  type="number"
                  value={year}
                  onChange={handleYearChange}
                  placeholder="ปี (ค.ศ.)"
                  className={`w-full border ${
                    errors.year ? 'border-red-500' : 'border-black-500'
                  } rounded-md px-2 h-9 text-black-900 focus:border-blue-600 focus:outline-none`}
                />
                {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <Select<OptionType, false>
                  options={monthOptions}
                  value={month}
                  onChange={(option: SingleValue<OptionType>) => {
                    setMonth(option);
                    if (day && option) {
                      const selectedMonth = Number(option.value);
                      const selectedYear = year ? Number(year) : new Date().getFullYear();
                      let maxDays = 31;

                      if ([4, 6, 9, 11].includes(selectedMonth)) {
                        maxDays = 30;
                      } else if (selectedMonth === 2) {
                        const isLeapYear =
                          (selectedYear % 4 === 0 && selectedYear % 100 !== 0) ||
                          selectedYear % 400 === 0;
                        maxDays = isLeapYear ? 29 : 28;
                      }

                      if (Number(day) > maxDays) {
                        setDay('');
                      }
                    }
                  }}
                  placeholder="เดือน"
                  isClearable
                  styles={{
                    control: (base) => ({
                      ...base,
                      height: 36,
                      minHeight: 36,
                      borderRadius: 6,
                      borderColor: errors.month ? '#ef4444' : '#B1B0AD',
                    }),
                    singleValue: (base) => ({ ...base, color: '#111827' }),
                    indicatorsContainer: (base) => ({ ...base, display: 'none' }),
                  }}
                />
                {errors.month && <p className="text-red-500 text-xs mt-1">{errors.month}</p>}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <input
                  type="number"
                  value={day}
                  onChange={handleDayChange}
                  min="1"
                  placeholder="วัน"
                  className={`w-full border ${
                    errors.day ? 'border-red-500' : 'border-black-500'
                  } rounded-md px-2 h-9 text-black-900 focus:border-blue-600 focus:outline-none`}
                />
                {errors.day && <p className="text-red-500 text-xs mt-1">{errors.day}</p>}
              </div>
            </div>
            {errors.deadline && <p className="text-red-500 text-xs mt-1">{errors.deadline}</p>}
          </div>
          <div className="flex justify-center mt-6">
            <button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all"
            >
              บันทึก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Goal;
