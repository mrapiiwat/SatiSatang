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
import type { Transaction, PaginationData } from '../../types/home';
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
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

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
    setCurrentPage(1);
  }, [selectedMonth, selectedYear]);

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
            <div className="flex flex-row overflow-y-auto max-h-[460px] md:flex md:justify-center">
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
                        className={`border-l-4 ${isToday ? 'border-blue-600' : 'border-black-700'} absolute top-0 left-0 h-14`}
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

      {isChatOpen ? null : <FloatingBubble onClick={handleBubbleClick} />}

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
