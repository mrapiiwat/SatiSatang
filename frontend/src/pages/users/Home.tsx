import { useState, useEffect, useCallback } from 'react';
import PageWrapper from '../../components/PageWrapper';
import FloatingBubble from '../../components/user/FloatingBubble';
import MonthHeader from '../../components/user/MonthHeader';
import { PiChartPieSliceLight } from 'react-icons/pi';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/Modal';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import Manual from '../../components/user/Manual';
import Upload from '../../components/user/Upload';
import Budget from '../../components/user/Budget';
import Goal from '../../components/user/Goal';
import type { Transaction, PaginationData, MyGoal } from '../../types/home';
import axios from '../../api/axios';
import DayTransactions from '../../components/user/DayTransactions';
import { showToastAlert } from '../../store/toastStore';
import Sati from '../../components/user/Sati';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [goals, setGoals] = useState<MyGoal[]>([]);
  const [goalIndex, setGoalIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  const fetchGoals = useCallback(async () => {
    try {
      const res = await axios.get(`/goal?month=${selectedMonth}&year=${selectedYear}`);
      setGoals(res.data.data || []);
      setGoalIndex(0);
    } catch (err) {
      console.error(err);
      showToastAlert('เกิดข้อผิดพลาดในการดึง goal', 'error');
    }
  }, [selectedMonth, selectedYear]);

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `/transaction?month=${selectedMonth}&year=${selectedYear}&page=${currentPage}&limit=${pagination.limit}`,
      );
      setTransactions(response.data.data || []);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error(err);
      showToastAlert('เกิดข้อผิดพลาดในการดึงข้อมูล', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedYear, currentPage, pagination.limit]);

  useEffect(() => {
    fetchTransactions();
  }, [selectedMonth, selectedYear, currentPage, fetchTransactions]);
  useEffect(() => {
    fetchGoals();
  }, [selectedMonth, selectedYear, fetchGoals]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    if (isHovered || goals.length <= 1) return;
    const interval = setInterval(() => {
      setGoalIndex((prev) => (prev + 1) % goals.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [goalIndex, isHovered, goals.length]);

  const handleClosePopupAndRefetch = () => {
    setActivePopup(null);
    fetchTransactions();
    fetchGoals();
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

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < pagination.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const groupedByDate = transactions.reduce<Record<number, Transaction[]>>((acc, t) => {
    const dateKey = new Date(t.createdAt).getDate();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(t);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate)
    .map(Number)
    .sort((a, b) => b - a);

  const totalExpense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const { totalPages } = pagination;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

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
          <>
            {goals.length > 0 && (
              <div className="flex justify-center mb-4">
                <div
                  className="relative w-full max-w-2xl mx-auto bg-gray-100 p-3 rounded-lg"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-base">เป้าหมาย</h4>
                    <p className="text-xs text-black-500">
                      {goals[goalIndex].deadline
                        ? new Date(goals[goalIndex].deadline) < new Date()
                          ? 'ครบกำหนด'
                          : new Date(goals[goalIndex].deadline).toLocaleDateString('th-TH', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })
                        : 'ไม่มีระยะเวลากำหนด'}
                    </p>
                  </div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm text-black">{goals[goalIndex].name}</span>
                    <div className="text-xs text-gray-700">
                      <span className="text-green-600 font-semibold">
                        ฿ {goals[goalIndex].totalAmount.toLocaleString()}
                      </span>
                      <span className="text-gray-500">
                        {' '}
                        / ฿ {goals[goalIndex].amount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-gray-300 h-1.5 rounded-full mb-1">
                    <div
                      className="bg-green-600 h-1.5 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          (goals[goalIndex].totalAmount / goals[goalIndex].amount) * 100,
                          100,
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="flex justify-center gap-1 mt-3">
                    {goals.length > 1 && (
                      <>
                        {goals
                          .slice(
                            Math.min(Math.max(goalIndex - 2, 0), Math.max(goals.length - 5, 0)),
                            Math.min(Math.max(goalIndex - 2, 0) + 5, goals.length),
                          )
                          .map((_, idx) => {
                            const startIndex = Math.min(
                              Math.max(goalIndex - 2, 0),
                              Math.max(goals.length - 5, 0),
                            );
                            const realIndex = startIndex + idx;
                            return (
                              <span
                                key={realIndex}
                                onClick={() => setGoalIndex(realIndex)}
                                className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                                  goalIndex === realIndex ? 'bg-green-600' : 'bg-gray-400'
                                }`}
                              />
                            );
                          })}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-row md:flex md:justify-center">
              <div className="w-1/6 md:w-[7%]">
                {sortedDates.map((date) => {
                  const dayTransactions = groupedByDate[date];
                  const headerHeight = 64;
                  const transactionHeight =
                    dayTransactions.length === 0 ? 64 : dayTransactions.length * 64;
                  const totalHeight = headerHeight + transactionHeight;
                  const transaction = transactions.find(
                    (t) => new Date(t.createdAt).getDate() === date,
                  );
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
                        className={`border-l-4 ${
                          isToday ? 'border-blue-600' : 'border-black-700'
                        } absolute top-0 left-0 h-14`}
                      />
                      <p
                        className={`text-base font-medium ${
                          isToday ? 'text-blue-600' : 'text-black-700'
                        }`}
                      >
                        {dayLabel}
                      </p>
                      <p
                        className={`text-base font-bold ${
                          isToday ? 'text-blue-600' : 'text-black-700'
                        } leading-tight`}
                      >
                        {dayNumber}
                      </p>
                    </div>
                  );
                })}
              </div>
              <DayTransactions groupedByDate={groupedByDate} sortedDates={sortedDates} />
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center w-10 h-10 rounded-lg border border-black-300 hover:bg-black-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <MdKeyboardArrowLeft size={24} />
                </button>

                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' && handlePageClick(page)}
                    disabled={page === '...'}
                    className={`flex items-center justify-center min-w-10 h-10 px-2 rounded-lg transition-colors ${
                      page === currentPage
                        ? 'bg-blue-600 text-white font-semibold'
                        : page === '...'
                          ? 'cursor-default'
                          : 'border border-black-300 hover:bg-black-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === pagination.totalPages}
                  className="flex items-center justify-center w-10 h-10 rounded-lg border border-black-300 hover:bg-black-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <MdKeyboardArrowRight size={24} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {!isChatOpen && <FloatingBubble onClick={handleBubbleClick} />}
      {isChatOpen && (
        <Sati
          handleCloseChatModal={handleCloseChatModal}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          handleMenuSelect={handleMenuSelect}
        />
      )}

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
    </PageWrapper>
  );
};

export default Home;
