import React, { useState, useEffect } from 'react';
import MonthHeader from '../../components/user/MonthHeader';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useSearchParams } from 'react-router-dom';
import axios from '../../api/axios';
import type { Transaction, Goal } from '../../interface/summary';
import PageWrapper from '../../components/PageWrapper';

const Summary: React.FC = () => {
  const today = new Date();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialMonthParam = parseInt(searchParams.get('month') || '', 10);
  const initialYearParam = parseInt(searchParams.get('year') || '', 10);
  const defaultMonth =
    initialMonthParam && initialMonthParam >= 1 && initialMonthParam <= 12
      ? initialMonthParam
      : today.getMonth() + 1;
  const defaultYear =
    initialYearParam && initialYearParam >= 1900 ? initialYearParam : today.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [showIncomeDetail, setShowIncomeDetail] = useState(false);
  const [showExpenseDetail, setShowExpenseDetail] = useState(false);
  const [showGoalDetail, setShowGoalDetail] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  const COLORS = ['#5300E8', '#E278FA', '#C8E84D'];

  useEffect(() => {
    setSearchParams(
      {
        month: selectedMonth.toString(),
        year: selectedYear.toString(),
      },
      { replace: true },
    );
  }, [selectedMonth, selectedYear, setSearchParams]);

  const fetchSummary = async (month: number, year: number) => {
    try {
      const res = await axios.get(`/summary?month=${month}&year=${year}`);
      setTransactions(res.data.transactions);
      setGoals(res.data.goals);
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  useEffect(() => {
    fetchSummary(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  const filteredTransactions = transactions.filter((t) => {
    const date = new Date(t.date);
    return date.getMonth() + 1 === selectedMonth && date.getFullYear() === selectedYear;
  });

  const incomes = filteredTransactions.filter((t) => t.type === 'INCOME');
  const expenses = filteredTransactions.filter((t) => t.type === 'EXPENSE');

  const monthStart = new Date(selectedYear, selectedMonth - 1, 1);
  const monthEnd = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999);

  const filteredGoals = goals.filter((g) => {
    const createdAt = new Date(g.createdAt);
    const deadline = g.deadline ? new Date(g.deadline) : null;

    const goalStartBeforeMonthEnd = createdAt <= monthEnd;
    const goalEndAfterMonthStart = !deadline || deadline >= monthStart;

    return goalStartBeforeMonthEnd && goalEndAfterMonthStart && g.currentAmount > 0;
  });

  const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
  const totalGoal = filteredGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalSum = totalIncome + totalExpense + totalGoal;

  const data = [
    { name: 'รายรับ', value: totalIncome },
    { name: 'รายจ่าย', value: totalExpense },
    { name: 'เป้าหมาย', value: totalGoal },
  ];

  return (
    <PageWrapper animation="scale-fade">
      <div className="max-w-5xl mx-auto px-6 py-4 font-ibm text-black-900">
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
          <p className="text-blue-600 font-semibold text-xl mb-2">
            ฿{totalIncome.toLocaleString()}
          </p>
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${showIncomeDetail ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
          >
            {showIncomeDetail && (
              <>
                <p className="text-sm text-black-600 mb-2">จำนวนรายการ {incomes.length}</p>
                {incomes.length === 0 ? (
                  <p className="text-black-600 text-sm">ไม่มีข้อมูลรายรับ</p>
                ) : (
                  incomes.map((i) => (
                    <div key={i.id} className="flex justify-between text-sm mb-1">
                      <span className="line-clamp-1 break-all w-3/5 max-w-1/2">
                        {i.description}
                      </span>
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
            className={`transition-all duration-300 ease-in-out overflow-hidden ${showExpenseDetail ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
          >
            {showExpenseDetail && (
              <>
                <p className="text-sm text-black-600 mb-2">จำนวนรายการ {expenses.length}</p>
                {expenses.length === 0 ? (
                  <p className="text-black-600 text-sm">ไม่มีข้อมูลรายจ่าย</p>
                ) : (
                  expenses.map((e) => (
                    <div key={e.id} className="flex justify-between text-sm mb-1">
                      <span className="line-clamp-1 break-all">{e.description}</span>
                      <span className="text-purple-300">฿{e.amount.toLocaleString()}</span>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>

        <div className="bg-white border-2 border-black-400 rounded-xl shadow-sm p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">เป้าหมาย</span>
            <button
              onClick={() => setShowGoalDetail(!showGoalDetail)}
              className="flex items-center gap-1 bg-black-200 border border-black-400 rounded-[8px] px-2 py-[2px] text-sm text-black-700 hover:bg-black-300 transition"
            >
              <span>ดูเพิ่มเติม</span>
              {showGoalDetail ? (
                <MdKeyboardArrowUp className="text-lg" />
              ) : (
                <MdKeyboardArrowDown className="text-lg" />
              )}
            </button>
          </div>

          <p className="text-green-600 font-semibold text-xl mb-2">฿{totalGoal.toLocaleString()}</p>

          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              showGoalDetail ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'
            }`}
          >
            {showGoalDetail && (
              <>
                <p className="text-sm text-black-600 mb-2">จำนวนเป้าหมาย {filteredGoals.length}</p>

                {filteredGoals.length === 0 ? (
                  <p className="text-black-600 text-sm">ไม่มีเป้าหมาย</p>
                ) : (
                  filteredGoals.map((goal) => (
                    <div key={goal.id} className="flex justify-between items-center text-sm mb-1">
                      <span className="line-clamp-1 break-all">{goal.name}</span>
                      <span className="text-green-600 font-medium">
                        ฿{goal.currentAmount.toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Summary;
