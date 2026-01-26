import React, { useEffect, useState } from 'react';
import type { DayTransactionsProps } from '../../../interface/home';
import type { CategoriesType, Transaction } from '../../../interface/category';
import Image from '../../Image';
import axios from '../../../api/axios';
import Modal from '../../Modal';
import { MdArrowUpward, MdArrowDownward, MdEdit, MdDelete } from 'react-icons/md';
import { RxCross2 } from 'react-icons/rx';
import { showToastAlert } from '../../../store/toastStore';

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
                        <p className="text-sm text-gray-700 line-clamp-1 break-all">
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
          <div className="bg-white rounded-2xl py-2 w-full max-w-96 mx-auto p-0 overflow-hidden shadow-2xl relative flex flex-col">
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setSelectedTransaction(null)}
                className="flex justify-center items-center rounded-full w-12 h-12 hover:bg-black-100 cursor-pointer"
              >
                <RxCross2 size={25} />
              </button>
            </div>

            <div className="pt-10 pb-6 px-6 flex flex-col items-center">
              <div
                className={`
          mb-4 p-1.5 rounded-full h-24 w-24 flex items-center justify-center 
          ${selectedTransaction.type === 'INCOME' ? 'bg-green-50' : 'bg-red-50'}
        `}
              >
                <div className="w-full h-full rounded-full overflow-hidden shadow-sm border-4 border-white">
                  {categoryMap[selectedTransaction.categoryId] ? (
                    <Image
                      src={categoryMap[selectedTransaction.categoryId]}
                      alt="icon"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-full h-full flex items-center justify-center ${selectedTransaction.type === 'INCOME' ? 'text-green-500' : 'text-red-500'}`}
                    >
                      {selectedTransaction.type === 'INCOME' ? (
                        <MdArrowUpward size={32} />
                      ) : (
                        <MdArrowDownward size={32} />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <span
                className={`
          px-4 py-1 rounded-full text-xs font-bold mb-2
          ${selectedTransaction.type === 'INCOME' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}
        `}
              >
                {selectedTransaction.type === 'INCOME' ? 'รายรับ' : 'รายจ่าย'}
              </span>

              <h2 className="text-4xl font-black text-gray-800 mb-4 tracking-tight">
                <span
                  className={
                    selectedTransaction.type === 'INCOME'
                      ? 'text-green-500 mr-1'
                      : 'text-red-500 mr-1'
                  }
                >
                  {selectedTransaction.type === 'INCOME' ? '+' : '-'}
                </span>
                {selectedTransaction.amount.toLocaleString()}
              </h2>

              {selectedTransaction.description ? (
                <div className="w-full rounded-xl p-3">
                  <p className="text-gray-500 text-lg text-center leading-relaxed break-all line-clamp-3 overflow-hidden">
                    {selectedTransaction.description}
                  </p>
                </div>
              ) : (
                <p className="text-gray-300 text-xs italic">ไม่มีบันทึก</p>
              )}
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => handleEdit()}
                className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 font-semibold text-base flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
              >
                <MdEdit size={16} />
                แก้ไข
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-semibold text-base flex items-center justify-center gap-2 shadow-md hover:bg-red-600 active:scale-95 transition-all"
              >
                {isDeleting ? (
                  'กำลังลบ...'
                ) : (
                  <>
                    <MdDelete size={16} />
                    ลบ
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DayTransactions;
