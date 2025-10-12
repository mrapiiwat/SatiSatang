import { useState } from 'react';
import PageWrapper from '../../components/PageWrapper';
import FloatingBubble from '../../components/user/FloatingBubble';
import MonthHeader from '../../components/user/MonthHeader';
import { PiChartPieSliceLight } from 'react-icons/pi';
import { useNavigate } from "react-router-dom";

interface Transaction {
  id: number;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  createdAt: string;
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

const Home = () => {
  const today = new Date();
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  
  const handleGoToSummary = () => {
    navigate("/user/summary");
  };

  const handleBubbleClick = () => alert('เปิดแชท!');

  const filtered = mockTransactions.filter((t) => {
    const d = new Date(t.createdAt);
    return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
  });

  const groupedByDate = filtered.reduce<Record<number, Transaction[]>>((acc, t) => {
    const dateKey = new Date(t.createdAt).getDate();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(t);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate)
    .map(Number)
    .sort((a, b) => b - a);

  const totalExpense = filtered
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <PageWrapper animation="fade" duration={1.5}>
      <div className="px-6 py-4 font-ibm text-black-900">
        <MonthHeader
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={(month, year) => {
            setSelectedMonth(month);
            setSelectedYear(year);
          }}
        />
        <div className="text-center mb-6">
          <p className="text-sm mb-4">ยอดใช้จ่าย</p>
          <h1 className="text-[96px] mb-2 font-semibold leading-none">
            {totalExpense.toLocaleString()}
          </h1>
          <button
            onClick={handleGoToSummary}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-black-50 font-semibold text-[14px] rounded-[100px] w-[121px] h-[40px] transform transition-transform duration-200 ease-in-out hover:scale-105 mx-auto"
          >
            <PiChartPieSliceLight size={20} />
            ดูสรุป
          </button>
        </div>
        <div className="flex flex-row overflow-y-auto max-h-[460px] md:flex md:justify-center">
          <div className="w-1/6 md:w-[7%] bg-white">
            {sortedDates.map((date) => {
              const dayTransactions = groupedByDate[date];
              const headerHeight = 64;
              const transactionHeight =
                dayTransactions.length === 0 ? 64 : dayTransactions.length * 64;
              const totalHeight = headerHeight + transactionHeight;
              const transaction = filtered.find((t) => new Date(t.createdAt).getDate() === date);
              const transactionDate = new Date(transaction?.createdAt || '');
              const isToday = transactionDate.toDateString() === today.toDateString();
              const dayLabel = isToday
                ? 'วันนี้'
                : transactionDate.toLocaleDateString('th-TH', { weekday: 'short' });
              const dayNumber = transactionDate.getDate();
              return (
                <div
                  key={date}
                  className="relative flex flex-col items-center p-3"
                  style={{ height: `${totalHeight}px` }}
                >
                  <div
                    className={`border-l-4  ${isToday ? 'border-blue-600' : 'border-black-700'} absolute top-2 left-0 h-14`}
                  ></div>
                  <p
                    className={`text-base font-medium ${isToday ? 'text-blue-600' : 'text-black-700'}`}
                  >
                    {dayLabel}
                  </p>
                  <p
                    className={`text-base font-bold  ${isToday ? 'text-blue-600' : 'text-black-700'} leading-tight`}
                  >
                    {dayNumber}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="w-5/6 md:w-[70%]">
            {sortedDates.map((date) => {
              const dayTransactions = groupedByDate[date];
              const dayIncome = dayTransactions
                .filter((t) => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);
              const dayExpense = dayTransactions
                .filter((t) => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);
              return (
                <div key={date} className="box-border">
                  <div className="bg-blue-50 px-4 py-3 flex justify-between items-center h-16 relative">
                    <div className="flex flex-col justify-start items-start">
                      <span className="text-base font-semibold text-black">รายรับ</span>
                      <span className="text-black text-base">{dayIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col justify-end items-end">
                      <span className="text-base font-semibold text-black">รายจ่าย</span>
                      <span className="text-black text-base">{dayExpense.toLocaleString()}</span>
                    </div>
                  </div>
                  {dayTransactions.length === 0 ? (
                    <div className="bg-purple-100 text-center text-sm text-black flex items-center justify-center h-16">
                      ไม่มีรายการ
                    </div>
                  ) : (
                    <div className="bg-blue-100">
                      {dayTransactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between px-4 h-16"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-black-900 flex items-center justify-center">
                              <img src="../../../public/SATISATANG1.svg" alt="" />
                            </div>
                            <div>
                              <p className="font-semibold text-black text-base">
                                {transaction.type === 'income' ? 'รายรับ' : 'รายจ่าย'}
                              </p>
                              {transaction.description && (
                                <p className="text-sm text-gray-700">{transaction.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-blue-600 text-base">
                              {transaction.amount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="md:w-[5%]"></div>
        </div>
      </div>
      <FloatingBubble onClick={handleBubbleClick} />
    </PageWrapper>
  );
};

export default Home;
