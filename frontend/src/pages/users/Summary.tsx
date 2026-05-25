import React, { useState, useEffect, useRef } from 'react';
import HeaderSummary from '../../components/user/HeaderSummary';
import { MdKeyboardArrowDown, MdKeyboardArrowUp, MdDownload, MdShare } from 'react-icons/md';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useSearchParams } from 'react-router-dom';
import axios from '../../api/axios';
import type { Transaction, Goal } from '../../interface/summary';
import type { SummaryPeriod } from '../../interface/components';
import PageWrapper from '../../components/PageWrapper';
import { useTranslation } from 'react-i18next';
import html2canvas from 'html2canvas-pro';

const Summary: React.FC = () => {
  const { t } = useTranslation();
  const today = new Date();
  const [searchParams, setSearchParams] = useSearchParams();
  const printRef = useRef<HTMLDivElement>(null);
  const initialMonthParam = parseInt(searchParams.get('month') || '', 10);
  const initialYearParam = parseInt(searchParams.get('year') || '', 10);
  const initialDayParam = parseInt(searchParams.get('day') || '', 10);
  const initialPeriodParam = searchParams.get('period') as SummaryPeriod | null;
  const defaultMonth =
    initialMonthParam && initialMonthParam >= 1 && initialMonthParam <= 12
      ? initialMonthParam
      : today.getMonth() + 1;
  const defaultYear =
    initialYearParam && initialYearParam >= 1900 ? initialYearParam : today.getFullYear();
  const defaultDay =
    initialDayParam && initialDayParam >= 1 && initialDayParam <= 31
      ? initialDayParam
      : defaultMonth === today.getMonth() + 1 && defaultYear === today.getFullYear()
        ? today.getDate()
        : 1;
  const defaultPeriod: SummaryPeriod =
    initialPeriodParam === 'year' || initialPeriodParam === 'month' || initialPeriodParam === 'week'
      ? initialPeriodParam
      : 'month';

  const [selectedDate, setSelectedDate] = useState<Date>(
    new Date(defaultYear, defaultMonth - 1, defaultDay),
  );
  const [selectedPeriod, setSelectedPeriod] = useState<SummaryPeriod>(defaultPeriod);
  const [showIncomeDetail, setShowIncomeDetail] = useState(false);
  const [showExpenseDetail, setShowExpenseDetail] = useState(false);
  const [showGoalDetail, setShowGoalDetail] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  const selectedMonth = selectedDate.getMonth() + 1;
  const selectedYear = selectedDate.getFullYear();
  const selectedDay = selectedDate.getDate();

  const COLORS = ['#5300E8', '#E278FA', '#C8E84D'];

  useEffect(() => {
    setSearchParams(
      {
        month: selectedMonth.toString(),
        year: selectedYear.toString(),
        day: selectedDay.toString(),
        period: selectedPeriod,
      },
      { replace: true },
    );
  }, [selectedMonth, selectedYear, selectedDay, selectedPeriod, setSearchParams]);

  const fetchSummary = async (month: number, year: number, day: number, period: SummaryPeriod) => {
    try {
      const res = await axios.get(
        `/summary?month=${month}&year=${year}&day=${day}&period=${period}`,
      );
      setTransactions(res.data.transactions);
      setGoals(res.data.goals);
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  useEffect(() => {
    fetchSummary(selectedMonth, selectedYear, selectedDay, selectedPeriod);
  }, [selectedMonth, selectedYear, selectedDay, selectedPeriod]);

  const getDateRange = () => {
    if (selectedPeriod === 'year') {
      return {
        start: new Date(selectedYear, 0, 1),
        end: new Date(selectedYear, 11, 31, 23, 59, 59, 999),
      };
    }
    if (selectedPeriod === 'week') {
      const dayOfWeek = selectedDate.getDay();
      const diffToMonday = (dayOfWeek + 6) % 7;
      const start = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate() - diffToMonday,
      );
      const end = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate() + 6,
        23,
        59,
        59,
        999,
      );
      return { start, end };
    }
    return {
      start: new Date(selectedYear, selectedMonth - 1, 1),
      end: new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999),
    };
  };

  const { start: rangeStart, end: rangeEnd } = getDateRange();

  const handleDownload = async () => {
    if (!printRef.current) return;
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        backgroundColor: document.documentElement.classList.contains('dark')
          ? '#121212'
          : '#ffffff',
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `summary-${selectedYear}-${selectedMonth.toString().padStart(2, '0')}.png`;
      link.click();
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const handleShare = async () => {
    if (!printRef.current) return;
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        backgroundColor: document.documentElement.classList.contains('dark')
          ? '#121212'
          : '#ffffff',
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `summary-${selectedYear}-${selectedMonth}.png`, {
          type: 'image/png',
        });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: t('share_title', 'สรุปยอดเงิน'),
            files: [file],
          });
        } else {
          alert(t('share_not_supported', 'เบราว์เซอร์ของคุณไม่รองรับการแชร์ไฟล์ภาพ'));
        }
      });
    } catch (error) {
      console.error('Error sharing image:', error);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    const date = new Date(t.date);
    return date >= rangeStart && date <= rangeEnd;
  });

  const incomes = filteredTransactions.filter((t) => t.type === 'INCOME');
  const expenses = filteredTransactions.filter((t) => t.type === 'EXPENSE');

  const filteredGoals = goals.filter((g) => {
    const createdAt = new Date(g.createdAt);
    const deadline = g.deadline ? new Date(g.deadline) : null;

    const goalStartBeforeRangeEnd = createdAt <= rangeEnd;
    const goalEndAfterRangeStart = !deadline || deadline >= rangeStart;

    return goalStartBeforeRangeEnd && goalEndAfterRangeStart && g.currentAmount > 0;
  });

  const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
  const totalGoal = filteredGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalSum = totalIncome + totalExpense + totalGoal;

  const data = [
    { name: t('income_label', 'รายรับ'), value: totalIncome },
    { name: t('expense_label', 'รายจ่าย'), value: totalExpense },
    { name: t('goal_label', 'เป้าหมาย'), value: totalGoal },
  ];

  return (
    <PageWrapper animation="scale-fade">
      <div className="max-w-5xl mx-auto px-6 py-4 font-ibm text-black-900 dark:text-white">
        <div ref={printRef} className="pb-4">
          <HeaderSummary
            selectedDate={selectedDate}
            selectedPeriod={selectedPeriod}
            onDateChange={(date) => setSelectedDate(date)}
            onPeriodChange={(period) => setSelectedPeriod(period)}
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
                    formatter={(value: number, name: string) => [
                      `฿${value.toLocaleString()}`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>

              {totalSum > 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-xs font-semibold text-black-900 dark:text-white leading-tight">
                  <p>
                    {t('income_label', 'รายรับ')} {Math.round((totalIncome / totalSum) * 100)}%
                  </p>
                  <p>
                    {t('expense_label', 'รายจ่าย')} {Math.round((totalExpense / totalSum) * 100)}%
                  </p>
                  <p>
                    {t('goal_label', 'เป้าหมาย')} {Math.round((totalGoal / totalSum) * 100)}%
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-8 text-sm font-medium mt-3">
              <div className="flex flex-col items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#5300E8]" />
                <span className="text-black-900 dark:text-gray-300">
                  {t('income_label', 'รายรับ')}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#E278FA]" />
                <span className="text-black-900 dark:text-gray-300">
                  {t('expense_label', 'รายจ่าย')}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#C8E84D]" />
                <span className="text-black-900 dark:text-gray-300">
                  {t('goal_label', 'เป้าหมาย')}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-black-800 border-2 border-black-400 dark:border-black-600 rounded-xl shadow-sm p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t('total_income', 'รายรับทั้งหมด')}
              </span>
              <button
                onClick={() => setShowIncomeDetail(!showIncomeDetail)}
                className="flex items-center gap-1 bg-black-200 dark:bg-black-700 border border-black-400 dark:border-black-600 rounded-[8px] px-2 py-[2px] text-sm text-black-700 dark:text-gray-300 hover:bg-black-300 dark:hover:bg-black-600 transition"
              >
                <span>{t('view_more', 'ดูเพิ่มเติม')}</span>
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
                  <p className="text-sm text-black-600 dark:text-gray-400 mb-2">
                    {t('item_count', {
                      count: incomes.length,
                      defaultValue: `จำนวนรายการ ${incomes.length}`,
                    })}
                  </p>
                  {incomes.length === 0 ? (
                    <p className="text-black-600 dark:text-gray-400 text-sm">
                      {t('no_income_data', 'ไม่มีข้อมูลรายรับ')}
                    </p>
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

          <div className="bg-white dark:bg-black-800 border-2 border-black-400 dark:border-black-600 rounded-xl shadow-sm p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t('total_expense', 'รายจ่ายทั้งหมด')}
              </span>
              <button
                onClick={() => setShowExpenseDetail(!showExpenseDetail)}
                className="flex items-center gap-1 bg-black-200 dark:bg-black-700 border border-black-400 dark:border-black-600 rounded-[8px] px-2 py-[2px] text-sm text-black-700 dark:text-gray-300 hover:bg-black-300 dark:hover:bg-black-600 transition"
              >
                <span>{t('view_more', 'ดูเพิ่มเติม')}</span>
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
                  <p className="text-sm text-black-600 dark:text-gray-400 mb-2">
                    {t('item_count', {
                      count: expenses.length,
                      defaultValue: `จำนวนรายการ ${expenses.length}`,
                    })}
                  </p>
                  {expenses.length === 0 ? (
                    <p className="text-black-600 dark:text-gray-400 text-sm">
                      {t('no_expense_data', 'ไม่มีข้อมูลรายจ่าย')}
                    </p>
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

          <div className="bg-white dark:bg-black-800 border-2 border-black-400 dark:border-black-600 rounded-xl shadow-sm p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t('goal_label', 'เป้าหมาย')}
              </span>
              <button
                onClick={() => setShowGoalDetail(!showGoalDetail)}
                className="flex items-center gap-1 bg-black-200 dark:bg-black-700 border border-black-400 dark:border-black-600 rounded-[8px] px-2 py-[2px] text-sm text-black-700 dark:text-gray-300 hover:bg-black-300 dark:hover:bg-black-600 transition"
              >
                <span>{t('view_more', 'ดูเพิ่มเติม')}</span>
                {showGoalDetail ? (
                  <MdKeyboardArrowUp className="text-lg" />
                ) : (
                  <MdKeyboardArrowDown className="text-lg" />
                )}
              </button>
            </div>

            <p className="text-green-600 font-semibold text-xl mb-2">
              ฿{totalGoal.toLocaleString()}
            </p>

            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                showGoalDetail ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'
              }`}
            >
              {showGoalDetail && (
                <>
                  <p className="text-sm text-black-600 dark:text-gray-400 mb-2">
                    {t('goal_count', {
                      count: filteredGoals.length,
                      defaultValue: `จำนวนเป้าหมาย ${filteredGoals.length}`,
                    })}
                  </p>

                  {filteredGoals.length === 0 ? (
                    <p className="text-black-600 dark:text-gray-400 text-sm">
                      {t('no_goal_data', 'ไม่มีเป้าหมาย')}
                    </p>
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

        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-black-200 dark:bg-black-700 hover:bg-black-300 dark:hover:bg-black-600 text-black-800 dark:text-white rounded-lg font-medium transition shadow-sm"
          >
            <MdShare className="text-xl" />
            {t('share', 'แชร์')}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition shadow-sm"
          >
            <MdDownload className="text-xl" />
            {t('download', 'ดาวน์โหลด')}
          </button>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Summary;
