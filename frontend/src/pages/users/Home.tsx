import { useState, useEffect, useCallback } from 'react';
import { PiChartPieSliceLight } from 'react-icons/pi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Modal from '../../components/Modal';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import type { Transaction, PaginationData, MyGoal, MyBudget } from '../../interface/home';
import axios from '../../api/axios';
import { showToastAlert } from '../../store/toastStore';
import PageWrapper from '../../components/PageWrapper';
import FloatingBubble from '../../components/user/home/FloatingBubble';
import MonthHeader from '../../components/user/MonthHeader';
import DayTransactions from '../../components/user/home/DayTransactions';
import Manual from '../../components/user/home/Manual';
import Upload from '../../components/user/home/Upload';
import Budget from '../../components/user/home/Budget';
import Goal from '../../components/user/home/Goal';
import Sati from '../../components/user/home/Sati';
import DeadlineDisplay from '../../components/user/home/DeadlineDisplay';
import { AnimatePresence, motion } from 'framer-motion';

const Home = () => {
  const today = new Date();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMonthParam = parseInt(searchParams.get('month') || '', 10);
  const initialYearParam = parseInt(searchParams.get('year') || '', 10);
  const defaultMonth =
    initialMonthParam && initialMonthParam >= 1 && initialMonthParam <= 12
      ? initialMonthParam
      : today.getMonth() + 1;
  const defaultYear =
    initialYearParam && initialYearParam >= 1900 ? initialYearParam : today.getFullYear();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [activePopup, setActivePopup] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [goals, setGoals] = useState<MyGoal[]>([]);
  const [budgets, setBudgets] = useState<MyBudget[]>([]);
  const [goalIndex, setGoalIndex] = useState(0);
  const [budgetIndex, setBudgetIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [now, setNow] = useState(new Date());
  const [showFrequency, setShowFrequency] = useState(true);
  const [totalExpense, setTotalExpense] = useState(0);
  const [editData, setEditData] = useState<Transaction | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

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

  const fetchBudget = useCallback(async () => {
    try {
      const res = await axios.get(
        `/budget?month=${selectedMonth}&year=${selectedYear}&isOverDeadline=false`,
      );
      setBudgets(res.data.data || []);
      setBudgetIndex(0);
    } catch (error) {
      console.error(error);
      showToastAlert('เกิดข้อผิดพลาดในการดึง budget', 'error');
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

  const fetchTotalExpense = useCallback(async () => {
    try {
      const res = await axios.get(
        `/transaction/total-expense?month=${selectedMonth}&year=${selectedYear}`,
      );
      setTotalExpense(res.data.totalExpense || 0);
    } catch (err) {
      console.error(err);
    }
  }, [selectedMonth, selectedYear]);

  const handleOpenEdit = (transaction: Transaction) => {
    setEditData(transaction);
    setActivePopup('manual');
  };

  const handleRefreshAll = useCallback(() => {
    fetchTransactions();
    fetchGoals();
    fetchTotalExpense();
    fetchBudget();
  }, [fetchTransactions, fetchGoals, fetchTotalExpense, fetchBudget]);

  useEffect(() => {
    if (!isChatOpen) return;

    const handleNavClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('nav')) {
        setIsChatOpen(false);
      }
    };

    document.addEventListener('mousedown', handleNavClick);

    return () => {
      document.removeEventListener('mousedown', handleNavClick);
    };
  }, [isChatOpen]);

  useEffect(() => {
    setSearchParams(
      {
        month: selectedMonth.toString(),
        year: selectedYear.toString(),
      },
      { replace: true },
    );
  }, [selectedMonth, selectedYear, setSearchParams]);

  useEffect(() => {
    fetchTransactions();
  }, [selectedMonth, selectedYear, currentPage, fetchTransactions]);

  useEffect(() => {
    fetchTotalExpense();
  }, [transactions, fetchTotalExpense]);

  useEffect(() => {
    fetchGoals();
  }, [selectedMonth, selectedYear, fetchGoals]);

  useEffect(() => {
    fetchBudget();
  }, [selectedMonth, selectedYear, fetchBudget, transactions]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isHovered || goals.length <= 1) return;
    const interval = setInterval(() => {
      setGoalIndex((prev) => (prev + 1) % goals.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [goalIndex, isHovered, goals.length]);

  useEffect(() => {
    if (isHovered || budgets.length <= 1) return;
    const interval = setInterval(() => {
      setBudgetIndex((prev) => (prev + 1) % budgets.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [budgetIndex, isHovered, budgets.length]);

  const handleClosePopupAndRefetch = () => {
    setActivePopup(null);
    setEditData(null);
    fetchTransactions();
    fetchGoals();
    fetchTotalExpense();
  };

  const handleGoToSummary = () => {
    navigate(`/user/summary?month=${selectedMonth}&year=${selectedYear}`);
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

  const getFontSize = (amount: number) => {
    const str = amount.toLocaleString();
    if (str.length > 12) return 'text-5xl md:text-6xl lg:text-6xl';
    if (str.length > 8) return 'text-7xl md:text-8xl lg:text-8xl';
    return 'text-[96px] md:text-8xl lg:text-9xl';
  };

  return (
    <PageWrapper animation="scale-fade">
      <div className="px-6 py-4 font-ibm text-black-900">
        <MonthHeader
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={handleMonthChange}
        />
        <div className="text-center mb-6">
          <p className="text-sm mb-4">ยอดใช้จ่าย</p>
          <h1
            className={`${getFontSize(totalExpense)} mb-2 font-semibold leading-none transition-all`}
          >
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
            <div className="flex flex-col md:max-w-[80%] md:flex-col lg:flex-row lg:justify-center lg:gap-4 mb-6 w-full lg:w-4/5 mx-auto">
              {budgets.length > 0 && budgetIndex < budgets.length && (
                <div
                  className="relative w-full lg:w-1/2 bg-gray-100 p-3 rounded-lg mb-4 lg:mb-0 flex flex-col"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-base">งบที่ตั้งไว้</h4>
                    <p
                      className="text-xs text-black-500 cursor-pointer"
                      onClick={() => setShowFrequency(!showFrequency)}
                    >
                      <AnimatePresence mode="wait">
                        {showFrequency ? (
                          <motion.span
                            key="frequency"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                          >
                            {budgets[budgetIndex]?.frequency === 'DAILY'
                              ? 'รายวัน'
                              : budgets[budgetIndex]?.frequency === 'WEEKLY'
                                ? 'รายสัปดาห์'
                                : budgets[budgetIndex]?.frequency === 'MONTHLY'
                                  ? 'รายเดือน'
                                  : budgets[budgetIndex]?.frequency === 'YEARLY'
                                    ? 'รายปี'
                                    : 'ครั้งเดียว'}
                          </motion.span>
                        ) : (
                          <motion.span
                            key="deadline"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                          >
                            <DeadlineDisplay deadline={budgets[budgetIndex]?.deadline} now={now} />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </p>
                  </div>

                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm text-black">
                      {budgets[budgetIndex]?.category?.name || 'ไม่ระบุหมวดหมู่'}
                    </span>
                    <div className="text-xs text-gray-700">
                      <span className="text-purple-300 font-semibold">
                        ฿ {budgets[budgetIndex]?.currentAmount?.toLocaleString() || 0}
                      </span>
                      <span className="text-gray-500">
                        {' '}
                        / ฿ {budgets[budgetIndex]?.amount?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-gray-300 h-1.5 rounded-full mb-1">
                    <div
                      className="bg-purple-300 h-1.5 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          ((budgets[budgetIndex]?.currentAmount || 0) /
                            (budgets[budgetIndex]?.amount || 1)) *
                            100,
                          100,
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="flex justify-center gap-1 mt-3">
                    {budgets.length > 1 &&
                      budgets
                        .slice(
                          Math.min(Math.max(budgetIndex - 2, 0), Math.max(budgets.length - 5, 0)),
                          Math.min(Math.max(budgetIndex - 2, 0) + 5, budgets.length),
                        )
                        .map((_, idx) => {
                          const startIndex = Math.min(
                            Math.max(budgetIndex - 2, 0),
                            Math.max(budgets.length - 5, 0),
                          );
                          const realIndex = startIndex + idx;
                          return (
                            <span
                              key={realIndex}
                              onClick={() => setBudgetIndex(realIndex)}
                              className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                                budgetIndex === realIndex ? 'bg-purple-300' : 'bg-gray-400'
                              }`}
                            />
                          );
                        })}
                  </div>
                </div>
              )}

              {goals.length > 0 && (
                <div
                  className="relative w-full lg:w-1/2 bg-gray-100 p-3 rounded-lg flex flex-col"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-base">เป้าหมาย</h4>
                    <p className="text-xs text-black-500">
                      <DeadlineDisplay deadline={goals[goalIndex]?.deadline} now={now} />
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
                    {goals.length > 1 &&
                      goals
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
                  </div>
                </div>
              )}
            </div>

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
              <DayTransactions
                groupedByDate={groupedByDate}
                sortedDates={sortedDates}
                onRefresh={handleRefreshAll}
                onEdit={handleOpenEdit}
              />
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
            <Manual
              onClose={handleClosePopupAndRefetch}
              onSuccess={fetchTransactions}
              editData={editData}
            />
          )}
          {activePopup === 'budget' && <Budget onClose={handleClosePopupAndRefetch} />}
          {activePopup === 'goal' && <Goal onClose={handleClosePopupAndRefetch} />}
        </div>
      </Modal>
    </PageWrapper>
  );
};

export default Home;
