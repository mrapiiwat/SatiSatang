import React, { useState } from 'react';
import MonthHeader from '../../components/user/MonthHeader';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface Transaction {
  id: number;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  createdAt: string;
}

interface Goal {
  id: number;
  name: string;
  amount: number;
  currentAmount: number;
  deadline?: string;
}

const mockTransactions: Transaction[] = [
  {
    id: 1,
    type: 'income',
    description: 'รายรับจากเซเว่น',
    amount: 1500,
    createdAt: '2025-10-12T14:48:46.904Z',
  },
  { id: 2, type: 'expense', description: 'กาแฟ', amount: 50, createdAt: '2025-09-01T10:00:00Z' },
  {
    id: 3,
    type: 'expense',
    description: 'ข้าวกลางวัน',
    amount: 80,
    createdAt: '2025-09-02T12:30:00Z',
  },
  {
    id: 4,
    type: 'income',
    description: 'เงินเดือน',
    amount: 20000,
    createdAt: '2025-09-05T08:00:00Z',
  },
  {
    id: 5,
    type: 'expense',
    description: 'น้ำมันรถ',
    amount: 600,
    createdAt: '2025-09-05T09:30:00Z',
  },
  { id: 6, type: 'income', description: 'โบนัส', amount: 5000, createdAt: '2025-10-01T10:00:00Z' },
  {
    id: 7,
    type: 'expense',
    description: 'ข้าวเช้า',
    amount: 45,
    createdAt: '2025-10-01T08:00:00Z',
  },
  { id: 8, type: 'expense', description: 'ขนม', amount: 25, createdAt: '2025-10-03T14:00:00Z' },
];

const mockGoals: Goal[] = [{ id: 1, name: 'iPhone 17', amount: 1000, currentAmount: 0 }];

const Summary: React.FC = () => {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [showIncomeDetail, setShowIncomeDetail] = useState(false);
  const [showExpenseDetail, setShowExpenseDetail] = useState(false);

  const filteredTransactions = mockTransactions.filter((t) => {
    const date = new Date(t.createdAt);
    return date.getMonth() + 1 === selectedMonth && date.getFullYear() === selectedYear;
  });

  const incomes = filteredTransactions.filter((t) => t.type === 'income');
  const expenses = filteredTransactions.filter((t) => t.type === 'expense');

  const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
  const totalGoal = mockGoals.reduce((sum, g) => sum + g.amount, 0);
  const totalSum = totalIncome + totalExpense + totalGoal;

  const COLORS = ['#5300E8', '#E278FA', '#C8E84D'];
  const data = [
    { name: 'รายรับ', value: totalIncome },
    { name: 'รายจ่าย', value: totalExpense },
    { name: 'เป้าหมาย', value: totalGoal },
  ];

  return (
    <div className="px-6 py-4 font-ibm text-black-900">
      <MonthHeader
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={(month, year) => {
          setSelectedMonth(month);
          setSelectedYear(year);
        }}
      />

      <div className="flex flex-col items-center mb-8">
        <div className="relative w-full h-[260px]">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [`฿${value.toLocaleString()}`, name]}
              />
            </PieChart>
          </ResponsiveContainer>

          {totalSum > 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-xs font-semibold text-black-900 leading-tight">
              <p>รายรับ {Math.round((totalIncome / totalSum) * 100)}%</p>
              <p>รายจ่าย {Math.round((totalExpense / totalSum) * 100)}%</p>
              <p>เป้าหมาย {Math.round((totalGoal / totalSum) * 100)}%</p>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-8 text-sm font-medium mt-3">
          <div className="flex flex-col items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-[#5300E8]" />
            <span className="text-black-900">รายรับ</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-[#E278FA]" />
            <span className="text-black-900">รายจ่าย</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-[#C8E84D]" />
            <span className="text-black-900">เป้าหมาย</span>
          </div>
        </div>
      </div>

      <div className="bg-white border-2 border-black-400 rounded-xl shadow-sm p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">รายรับทั้งหมด</span>
          <button
            onClick={() => setShowIncomeDetail(!showIncomeDetail)}
            className="flex items-center gap-1 bg-black-200 border border-black-400 rounded-[8px] px-2 py-[2px] text-sm text-black-700 hover:bg-black-300 transition"
          >
            <span>ดูเพิ่มเติม</span>
            {showIncomeDetail ? (
              <MdKeyboardArrowUp className="text-lg" />
            ) : (
              <MdKeyboardArrowDown className="text-lg" />
            )}
          </button>
        </div>

        <p className="text-blue-600 font-semibold text-xl mb-2">฿{totalIncome.toLocaleString()}</p>

        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            showIncomeDetail ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'
          }`}
        >
          {showIncomeDetail && (
            <>
              <p className="text-sm text-black-600 mb-2">จำนวนรายการ {incomes.length}</p>
              <p className="font-semibold text-sm mb-1">รายละเอียดตามหมวดหมู่</p>
              {incomes.length === 0 ? (
                <p className="text-black-600 text-sm">ไม่มีข้อมูลรายรับ</p>
              ) : (
                incomes.map((i) => (
                  <div key={i.id} className="flex justify-between text-sm mb-1">
                    <span>{i.description}</span>
                    <span className="text-blue-600">฿{i.amount.toLocaleString()}</span>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>

      <div className="bg-white border-2 border-black-400 rounded-xl shadow-sm p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">รายจ่ายทั้งหมด</span>
          <button
            onClick={() => setShowExpenseDetail(!showExpenseDetail)}
            className="flex items-center gap-1 bg-black-200 border border-black-400 rounded-[8px] px-2 py-[2px] text-sm text-black-700 hover:bg-black-300 transition"
          >
            <span>ดูเพิ่มเติม</span>
            {showExpenseDetail ? (
              <MdKeyboardArrowUp className="text-lg" />
            ) : (
              <MdKeyboardArrowDown className="text-lg" />
            )}
          </button>
        </div>

        <p className="text-purple-300 font-semibold text-xl mb-2">
          ฿{totalExpense.toLocaleString()}
        </p>

        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            showExpenseDetail ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'
          }`}
        >
          {showExpenseDetail && (
            <>
              <p className="text-sm text-black-600 mb-2">จำนวนรายการ {expenses.length}</p>
              <p className="font-semibold text-sm mb-1">รายละเอียดตามหมวดหมู่</p>
              {expenses.length === 0 ? (
                <p className="text-black-600 text-sm">ไม่มีข้อมูลรายจ่าย</p>
              ) : (
                expenses.map((e) => (
                  <div key={e.id} className="flex justify-between text-sm mb-1">
                    <span>{e.description}</span>
                    <span className="text-purple-300">฿{e.amount.toLocaleString()}</span>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>

      <div className="bg-white border-2 border-black-400 rounded-xl shadow-sm p-4 mb-4">
        <p className="font-semibold text-gray-700 mb-2">เป้าหมาย</p>
        {mockGoals.map((goal) => (
          <div key={goal.id} className="flex justify-between text-sm mb-1">
            <span>{goal.name}</span>
            <span className="text-green-500 font-semibold text-xl">
              ฿{goal.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Summary;
