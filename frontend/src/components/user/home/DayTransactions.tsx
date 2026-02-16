import React, { useEffect, useState } from 'react';
import type { DayTransactionsProps } from '../../../interface/home';
import type { CategoriesType, Transaction } from '../../../interface/category';
import Image from '../../Image';
import axios from '../../../api/axios';
import Modal from '../../Modal';
import { MdArrowUpward, MdArrowDownward } from 'react-icons/md';
import { RxCross2 } from 'react-icons/rx';
import { showToastAlert } from '../../../store/toastStore';
import { MdSubject } from 'react-icons/md';

const DayTransactions: React.FC<DayTransactionsProps> = ({
  groupedByDate,
  sortedDates,
  onRefresh,
  onEdit,
}) => {
  const [categoryMap, setCategoryMap] = useState<Record<number, string>>({});
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/categories');
        const categories: CategoriesType[] = res.data.data || [];
        const map: Record<number, string> = {};
        categories.forEach((c) => {
          map[c.id] = c.icon;
        });
        setCategoryMap(map);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  const handleDelete = async () => {
    if (!selectedTransaction) return;

    setIsDeleting(true);
    try {
      await axios.delete(`/transaction/${selectedTransaction.id}`);
      showToastAlert('ลบรายการสำเร็จ', 'success');
      setSelectedTransaction(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      showToastAlert('ไม่สามารถลบรายการได้', err instanceof Error ? 'error' : 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    if (!selectedTransaction || !onEdit) return;
    onEdit(selectedTransaction);
    setSelectedTransaction(null);
  };

  if (sortedDates.length === 0)
    return (
      <p className="absolute inset-x-0 flex items-center justify-center text-black-600 text-base">
        ยังไม่มีรายการ
      </p>
    );

  return (
    <div className="w-5/6 md:w-[70%]">
      {sortedDates.map((date) => {
        const dayTransactions = groupedByDate[date];
        const dayIncome = dayTransactions
          .filter((t) => t.type === 'INCOME')
          .reduce((sum, t) => sum + t.amount, 0);
        const dayExpense = dayTransactions
          .filter((t) => t.type === 'EXPENSE')
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

            <div className="bg-blue-100">
              {dayTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between px-4 h-16 cursor-pointer"
                  onClick={() => setSelectedTransaction(transaction)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {categoryMap[transaction.categoryId] ? (
                        <Image
                          src={categoryMap[transaction.categoryId]}
                          alt={transaction.description || 'category icon'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 animate-pulse" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-black text-base">
                        {transaction.type === 'INCOME' ? 'รายรับ' : 'รายจ่าย'}
                      </p>
                      {transaction.description && (
                        <p className="text-sm text-gray-700 line-clamp-1 break-all w-32 md:w-48">
                          {transaction.description}
                        </p>
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
          </div>
        );
      })}
      <Modal isOpen={!!selectedTransaction} onClose={() => setSelectedTransaction(null)}>
        {selectedTransaction && (
          <div className="flex justify-center items-center" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white w-full max-w-96 rounded-2xl py-7 px-8">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-semibold text-lg">รายละเอียด</h4>
                <div
                  onClick={() => setSelectedTransaction(null)}
                  className="bg-black-300 flex justify-center items-center rounded-full w-12 h-12 hover:bg-black-400 cursor-pointer"
                >
                  <RxCross2 size={20} />
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100">
                  {categoryMap[selectedTransaction.categoryId] ? (
                    <Image
                      src={categoryMap[selectedTransaction.categoryId]}
                      alt="icon"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-full h-full flex items-center justify-center ${
                        selectedTransaction.type === 'INCOME'
                          ? 'text-green-500 bg-green-50'
                          : 'text-red-500 bg-red-50'
                      }`}
                    >
                      {selectedTransaction.type === 'INCOME' ? (
                        <MdArrowUpward size={28} />
                      ) : (
                        <MdArrowDownward size={28} />
                      )}
                    </div>
                  )}
                </div>

                <div className="text-center mb-2">
                  <div
                    className={`text-sm font-bold mb-1 ${selectedTransaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {selectedTransaction.type === 'INCOME' ? 'รายรับ' : 'รายจ่าย'}
                  </div>
                  <h2
                    className={`text-3xl font-bold ${selectedTransaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {selectedTransaction.type === 'INCOME' ? '+' : '-'}
                    {selectedTransaction.amount.toLocaleString()}
                  </h2>
                </div>

                <div className="w-full mt-2">
                  {selectedTransaction.description ? (
                    <div className="flex gap-3 items-start bg-gray-50 rounded-2xl p-4">
                      <div className="text-gray-400 mt-0.5 flex-shrink-0">
                        <MdSubject size={18} />
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed break-words text-left">
                        {selectedTransaction.description}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-row-reverse items-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition"
                >
                  {isDeleting ? 'กำลังลบ...' : 'ลบ'}
                </button>

                <button
                  type="button"
                  onClick={() => handleEdit()}
                  className="flex-1 bg-blue-600 py-3 rounded-xl text-white text-sm font-semibold hover:bg-blue-700 transition"
                >
                  แก้ไข
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DayTransactions;
