import { useState, useEffect, useCallback } from 'react';
import PageWrapper from '../../components/PageWrapper';
import FloatingBubble from '../../components/user/FloatingBubble';
import MonthHeader from '../../components/user/MonthHeader';
import { PiChartPieSliceLight } from 'react-icons/pi';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/Modal';
import { GoArrowUp } from 'react-icons/go';
import { FaPlus } from 'react-icons/fa6';
import { RxCross2 } from 'react-icons/rx';
import Manual from '../../components/user/Manual';
import Upload from '../../components/user/Upload';
import Budget from '../../components/user/Budget';
import Goal from '../../components/user/Goal';
import type { Transaction } from '../../types/home';
import axios from '../../api/axios';
import DayTransactions from '../../components/user/DayTransactions';
import AddMenu from '../../components/user/AddMenu';

const Home = () => {
  const today = new Date();
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activePopup, setActivePopup] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/transaction?month=${selectedMonth}&year=${selectedYear}`);
      setTransactions(response.data.data || []);
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchTransactions();
  }, [selectedMonth, selectedYear, fetchTransactions]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleClosePopupAndRefetch = () => {
    setActivePopup(null);
    fetchTransactions();
  };

  const handleGoToSummary = () => {
    navigate('/user/summary');
  };

  const handleBubbleClick = () => setIsChatOpen(true);
  const handleCloseChatModal = () => setIsChatOpen(false);

  const handleMenuSelect = (type: string) => {
    setActivePopup(type);
    setIsMenuOpen(false);
  };

  const filtered = transactions.filter((t) => {
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
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <PageWrapper animation="scale-fade">
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

        {isLoading ? (
          <div className="text-center py-10">
            <p>กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <div className="flex flex-row overflow-y-auto max-h-[460px] md:flex md:justify-center">
            <div className="w-1/6 md:w-[7%]">
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
                    className="relative flex flex-col items-center"
                    style={{ height: `${totalHeight}px` }}
                  >
                    <div
                      className={`border-l-4 ${isToday ? 'border-blue-600' : 'border-black-700'} absolute top-0 left-0 h-16`}
                    />
                    <p
                      className={`text-base font-medium ${isToday ? 'text-blue-600' : 'text-black-700'}`}
                    >
                      {dayLabel}
                    </p>
                    <p
                      className={`text-base font-bold ${isToday ? 'text-blue-600' : 'text-black-700'} leading-tight`}
                    >
                      {dayNumber}
                    </p>
                  </div>
                );
              })}
            </div>
            <DayTransactions groupedByDate={groupedByDate} sortedDates={sortedDates} />
          </div>
        )}
      </div>

      {isChatOpen ? null : <FloatingBubble onClick={handleBubbleClick} />}

      <Modal isOpen={isChatOpen} onClose={handleCloseChatModal}>
        <div className="min-h-[calc(100vh-80px)] min-w-full flex flex-col justify-evenly items-center px-6 pt-5">
          <div className="border-[1px] bg-white border-black-600 rounded-xl flex-1 w-full overflow-y-auto p-2 max-h-[75vh] scrollbar-none">
            <div className="flex justify-end m-3">
              <div
                className="bg-black-300 flex justify-center items-center rounded-full w-12 h-12 hover:bg-black-400"
                onClick={handleCloseChatModal}
              >
                <RxCross2 size={25} />
              </div>
            </div>
            <div>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. A ducimus atque ipsum
              necessitatibus velit culpa error eos, sit ratione est minima accusamus voluptas
              dolores nulla architecto porro dignissimos expedita quas iure impedit cumque molestias
              nobis aperiam! Ipsum veniam natus facere omnis, sequi eveniet aut ea recusandae
              laudantium doloribus! Unde doloremque vel saepe perspiciatis recusandae sapiente,
              expedita non dicta molestias dolor eveniet eos nisi accusantium! Sapiente dolorum, ex
              ratione placeat temporibus eveniet eius recusandae, debitis nobis assumenda quam
              obcaecati labore quasi similique aut cum maiores magni, in eligendi nostrum odit
              impedit officiis? Perferendis fugit, laborum harum veniam debitis molestiae dicta
              accusantium?
            </div>
          </div>
          <div className="flex flex-row justify-between gap-3 w-full ">
            <div
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex justify-center items-center min-w-16 min-h-16 bg-blue-600 rounded-full relative cursor-pointer hover:bg-blue-700"
            >
              <FaPlus size={25} color="white" />
              <AddMenu
                isOpen={isMenuOpen}
                onSelect={handleMenuSelect}
                onClose={() => setIsMenuOpen(false)}
              />
              <Modal isOpen={!!activePopup} onClose={handleClosePopupAndRefetch}>
                <div>
                  {activePopup === 'upload' && <Upload onClose={handleClosePopupAndRefetch} />}
                  {activePopup === 'manual' && (
                    <Manual onClose={handleClosePopupAndRefetch} onSuccess={fetchTransactions} />
                  )}
                  {activePopup === 'budget' && <Budget onClose={handleClosePopupAndRefetch} />}
                  {activePopup === 'goal' && <Goal onClose={handleClosePopupAndRefetch} />}
                </div>
              </Modal>
            </div>

            <form className="w-full relative">
              <input
                className="flex justify-center items-center h-16 text-xl pl-4 px-3 w-full rounded-full border-2 border-black-900 pr-16"
                placeholder="ให้น้องสติช่วยจดนะ"
              />
              <button className="absolute translate-y-[-50%] right-2 top-1/2 bg-black-900 w-12 h-12 rounded-full flex justify-center items-center hover:bg-black-800">
                <GoArrowUp size={24} color="white" />
              </button>
            </form>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
};

export default Home;
