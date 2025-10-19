import React, { useState } from 'react';
import { RxCross2 } from 'react-icons/rx';
import type { GoalProps } from '../../types/home';

const Goal: React.FC<GoalProps> = ({ onClose }) => {
  const [goalName, setGoalName] = useState('');
  const [amount, setAmount] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateInputs = () => {
    const newErrors: Record<string, string> = {};

    if (!goalName.trim()) newErrors.goalName = 'กรุณากรอกชื่อเป้าหมาย';
    if (!amount.trim() || parseFloat(amount) <= 0) newErrors.amount = 'จำนวนเงินต้องมากกว่า 0';

    if (year && (isNaN(Number(year)) || Number(year) < 2025))
      newErrors.year = 'ปีต้องไม่น้อยกว่า 2025';
    if (month && (Number(month) < 1 || Number(month) > 12))
      newErrors.month = 'เดือนต้องอยู่ระหว่าง 1 - 12';
    if (day && (Number(day) < 1 || Number(day) > 31)) newErrors.day = 'วันต้องอยู่ระหว่าง 1 - 31';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateInputs()) return;

    const deadline =
      year && month && day ? `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}` : null;

    console.log({
      name: goalName,
      amount: Number(amount),
      deadline,
    });

    alert('บันทึกเป้าหมายสำเร็จ');
    onClose();
  };

  return (
    <div className="flex justify-center items-center px-6">
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
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="ปี"
                  className={`w-full border ${
                    errors.year ? 'border-red-500' : 'border-black-500'
                  } rounded-md px-2 h-9 text-black-900 focus:border-blue-600 focus:outline-none`}
                />
                {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <input
                  type="number"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  placeholder="เดือน"
                  className={`w-full border ${
                    errors.month ? 'border-red-500' : 'border-black-500'
                  } rounded-md px-2 h-9 text-black-900 focus:border-blue-600 focus:outline-none`}
                />
                {errors.month && <p className="text-red-500 text-xs mt-1">{errors.month}</p>}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <input
                  type="number"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  placeholder="วัน"
                  className={`w-full border ${
                    errors.day ? 'border-red-500' : 'border-black-500'
                  } rounded-md px-2 h-9 text-black-900 focus:border-blue-600 focus:outline-none`}
                />
                {errors.day && <p className="text-red-500 text-xs mt-1">{errors.day}</p>}
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-6">
            <button
              onClick={handleSave}
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
