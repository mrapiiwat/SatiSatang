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
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import Manual from '../../components/user/Manual';
import Upload from '../../components/user/Upload';
import Budget from '../../components/user/Budget';
import Goal from '../../components/user/Goal';
import type { Transaction } from '../../types/home';
import axios from '../../api/axios';
import DayTransactions from '../../components/user/DayTransactions';
import AddMenu from '../../components/user/AddMenu';
import { showToastAlert } from '../../store/toastStore';

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={handleCloseChatModal}>
          <div
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 animate-slide-up"
            style={{ height: 'calc(100vh - 80px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-full flex flex-col px-6 pt-5 pb-6">
              <div className="border-[1px] bg-white border-black-500 rounded-xl flex-1 w-full overflow-y-auto p-2 mb-4 scrollbar-none">
                <div className="flex justify-end m-3">
                  <div
                    className="bg-black-300 flex justify-center items-center rounded-full w-12 h-12 hover:bg-black-400 cursor-pointer"
                    onClick={handleCloseChatModal}
                  >
                    <RxCross2 size={25} />
                  </div>
                </div>
                <div>
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. A ducimus atque ipsum
                  necessitatibus velit culpa error eos, sit ratione est minima accusamus voluptas
                  dolores nulla architecto porro dignissimos expedita quas iure impedit cumque
                  molestias nobis aperiam! Ipsum veniam natus facere omnis, sequi eveniet aut ea
                  recusandae laudantium doloribus! Unde doloremque vel saepe perspiciatis recusandae
                  sapiente, expedita non dicta molestias dolor eveniet eos nisi accusantium!
                  Sapiente dolorum, ex ratione placeat temporibus eveniet eius recusandae, debitis
                  nobis assumenda quam obcaecati labore quasi similique aut cum maiores magni, in
                  eligendi nostrum odit impedit officiis? Perferendis fugit, laborum harum veniam
                  debitis molestiae dicta accusantium?
                </div>
              </div>
              <div className="flex flex-row justify-between gap-3 w-full">
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
                </div>

                <form className="w-full relative">
                  <input
                    className="flex justify-center items-center h-16 text-xl pl-4 px-3 w-full rounded-full border-2 border-black-400 pr-16"
                    placeholder="ให้น้องสติช่วยจดนะ"
                  />
                  <button className="absolute translate-y-[-50%] right-2 top-1/2 bg-black-900 w-12 h-12 rounded-full flex justify-center items-center hover:bg-black-800">
                    <GoArrowUp size={24} color="white" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
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
