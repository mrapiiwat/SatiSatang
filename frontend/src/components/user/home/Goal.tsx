import React, { useState, useMemo } from 'react';
import { RxCross2 } from 'react-icons/rx';
import Select, { type StylesConfig, type SingleValue } from 'react-select'; // เพิ่ม StylesConfig
import type { GoalProps, OptionType } from '../../../interface/home';
import axios from '../../../api/axios';
import { isAxiosError } from 'axios';
import { showToastAlert } from '../../../store/toastStore';

const Goal: React.FC<GoalProps> = ({ onClose }) => {
  const [goalName, setGoalName] = useState('');
  const [amount, setAmount] = useState('');

  const [year, setYear] = useState<SingleValue<OptionType>>(null);
  const [month, setMonth] = useState<SingleValue<OptionType>>(null);
  const [day, setDay] = useState<SingleValue<OptionType>>(null);

  const currentYear = new Date().getFullYear();

  const yearOptions: OptionType[] = Array.from({ length: 11 }, (_, i) => {
    const val = currentYear + i;
    return { value: String(val), label: String(val) };
  });

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

  const maxDays = useMemo(() => {
    if (!month) return 31;
    const m = Number(month.value);

    if ([4, 6, 9, 11].includes(m)) return 30;
    if (m === 2) {
      if (year) {
        const y = Number(year.value);
        const isLeap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
        return isLeap ? 29 : 28;
      }
      return 29;
    }
    return 31;
  }, [month, year]);

  const dayOptions: OptionType[] = useMemo(() => {
    return Array.from({ length: maxDays }, (_, i) => ({
      value: String(i + 1),
      label: String(i + 1),
    }));
  }, [maxDays]);

  const validateInputs = () => {
    const newErrors: Record<string, string> = {};

    if (!goalName.trim()) {
      newErrors.goalName = 'กรุณากรอกชื่อเป้าหมาย';
      showToastAlert(newErrors.goalName, 'error');
    }
    if (!amount.trim() || parseFloat(amount) <= 0) {
      newErrors.amount = 'จำนวนเงินต้องมากกว่า 0';
      showToastAlert(newErrors.amount, 'error');
    }

    if (year && month && day) {
      const selectedDate = new Date(
        Number(year.value),
        Number(month.value) - 1,
        Number(day.value)
      );
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.deadline = 'ตั้งเป้าหมายวันในอนาคตกันเถอะ!';
        showToastAlert(newErrors.deadline, 'error');
      }
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleYearChange = (option: SingleValue<OptionType>) => {
    setYear(option);

    if (!option) {
      setMonth(null);
      setDay(null);
      return;
    }

    const selectedY = Number(option.value);
    const currentM = new Date().getMonth() + 1;

    if (selectedY === currentYear && month && Number(month.value) < currentM) {
      setMonth(null);
      setDay(null);
      return;
    }

    if (month && day && Number(month.value) === 2 && Number(day.value) === 29) {
      const isLeap = (selectedY % 4 === 0 && selectedY % 100 !== 0) || selectedY % 400 === 0;
      if (!isLeap) setDay(null);
    }
  };

  const handleMonthChange = (option: SingleValue<OptionType>) => {
    setMonth(option);

    if (!option) {
      setDay(null);
      return;
    }

    if (day) {
      const newMonthVal = Number(option.value);
      const currentDayVal = Number(day.value);

      let newMax = 31;
      if ([4, 6, 9, 11].includes(newMonthVal)) newMax = 30;
      else if (newMonthVal === 2) {
        if (year) {
          const y = Number(year.value);
          const isLeap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
          newMax = isLeap ? 29 : 28;
        } else {
          newMax = 29;
        }
      }

      if (currentDayVal > newMax) {
        setDay(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    try {
      const deadline =
        year && month && day
          ? `${year.value}-${month.value.padStart(2, '0')}-${day.value.padStart(2, '0')}`
          : null;

      await axios.post('/goal', {
        name: goalName,
        amount: Number(amount),
        deadline,
      });

      await showToastAlert('บันทึกสำเร็จ', 'success');
      onClose();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        showToastAlert(err.response?.data?.message || 'เกิดข้อผิดพลาด', 'error');
      } else if (err instanceof Error) {
        showToastAlert(err.message, 'error');
      } else {
        showToastAlert('เกิดข้อผิดพลาดไม่ทราบชนิด', 'error');
      }
    }
  };

  const selectStyles: StylesConfig<OptionType, false> = {
    control: (base) => ({
      ...base,
      height: 36,
      minHeight: 36,
      borderRadius: 6,
      borderColor: '#B1B0AD',
    }),
    singleValue: (base) => ({ ...base, color: '#111827' }),
    indicatorsContainer: (base) => ({ ...base, display: 'none' }),
    valueContainer: (base) => ({ ...base, padding: '0 8px' }),
    menu: (base) => ({ ...base, zIndex: 9999 }),
    menuList: (base) => ({
      ...base,
      "::-webkit-scrollbar": {
        width: "0px",
        height: "0px",
        display: "none",
      },
      scrollbarWidth: "none",
      msOverflowStyle: "none",
    }),
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
              className="border border-black-500 w-full h-10 rounded-md px-3 text-black-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">จำนวนเงิน</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border border-black-500 w-full h-10 rounded-md px-3 text-black-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">ระยะเวลา</label>
            <div className="flex gap-2">
              <div className="flex flex-col flex-1 min-w-0">
                <Select<OptionType, false>
                  options={yearOptions}
                  value={year}
                  onChange={handleYearChange}
                  placeholder="ปี"
                  isClearable
                  isSearchable={false}
                  styles={selectStyles}
                />
              </div>

              <div className="flex flex-col flex-1 min-w-0">
                <Select<OptionType, false>
                  options={monthOptions}
                  value={month}
                  onChange={handleMonthChange}
                  placeholder="เดือน"
                  isClearable
                  isSearchable={false}
                  isOptionDisabled={(option) => {
                    if (!year) return false;
                    const currentY = new Date().getFullYear();
                    const currentM = new Date().getMonth() + 1;
                    return Number(year.value) === currentY && Number(option.value) < currentM;
                  }}
                  styles={selectStyles}
                />
              </div>

              <div className="flex flex-col flex-1 min-w-0">
                <Select<OptionType, false>
                  options={dayOptions}
                  value={day}
                  onChange={(option) => setDay(option)}
                  placeholder="วัน"
                  isClearable
                  isSearchable={false}
                  isOptionDisabled={(option) => {
                    if (!year || !month) return false;
                    const currentY = new Date().getFullYear();
                    const currentM = new Date().getMonth() + 1;
                    const currentD = new Date().getDate();

                    if (Number(year.value) === currentY && Number(month.value) === currentM) {
                      return Number(option.value) < currentD;
                    }
                    return false;
                  }}
                  styles={selectStyles}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-2">
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