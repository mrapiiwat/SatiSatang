import React, { useEffect, useState } from 'react';
import type { DayTransactionsProps, Transaction } from '../../../interface/home';
import type { CategoriesType } from '../../../interface/category';
import Image from '../../Image';
import axios from '../../../api/axios';
import Modal from '../../Modal';
import { RxCross2 } from 'react-icons/rx';
import { showToastAlert } from '../../../store/toastStore';
import { MdSubject } from 'react-icons/md';
import { MdOutlineNotInterested } from 'react-icons/md';
import DeleteModal from '../../DeleteModal';
import { useTranslation } from 'react-i18next';

const DayTransactions: React.FC<DayTransactionsProps> = ({
  groupedByDate,
  sortedDates,
  onRefresh,
  onEdit,
}) => {
  const { t } = useTranslation();
  const [categoryMap, setCategoryMap] = useState<Record<number, string>>({});
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

  const handleCloseMainModal = () => {
    if (isDeleteModalOpen || isDeleting) return;
    setSelectedTransaction(null);
  };

  const handleDelete = async () => {
    if (!selectedTransaction) return;

    setIsDeleting(true);
    try {
      await axios.delete(`/transaction/${selectedTransaction.id}`);
      showToastAlert(t('day_trans_delete_success', 'ลบรายการสำเร็จ'), 'success');

      setIsDeleteModalOpen(false);
      setSelectedTransaction(null);

      if (onRefresh) onRefresh();
    } catch {
      showToastAlert(t('day_trans_delete_error', 'ไม่สามารถลบรายการได้'), 'error');
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    if (!selectedTransaction || !onEdit) return;
    onEdit(selectedTransaction);
    setSelectedTransaction(null);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
  };

  if (sortedDates.length === 0)
    return (
      <p className="absolute inset-x-0 flex items-center justify-center text-black-600 text-base">
        {t('no_transactions', 'ยังไม่มีรายการ')}
      </p>
    );

  return (
    <div className="w-5/6 md:min-w-[550px] md:w-[50%]">
      {sortedDates.map((date, index) => {
        const dayTransactions = groupedByDate[date];
        const dayIncome = dayTransactions
          .filter((t) => t.type === 'INCOME')
          .reduce((sum, t) => sum + t.amount, 0);
        const dayExpense = dayTransactions
          .filter((t) => t.type === 'EXPENSE')
          .reduce((sum, t) => sum + t.amount, 0);

        const isLastDate = index === sortedDates.length - 1;

        return (
          <div key={date} className="box-border">
            <div
              className={`bg-blue-50 dark:bg-blue-950/30 px-4 py-3 flex justify-between items-center h-16 relative 
          ${index === 0 ? 'rounded-t-md' : ''}`}
            >
              <div className="flex flex-col justify-start items-start">
                <span className="text-base font-semibold text-black dark:text-white">
                  {t('income', 'รายรับ')}
                </span>
                <span className="text-black dark:text-white text-base">
                  {dayIncome.toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col justify-end items-end">
                <span className="text-base font-semibold text-black dark:text-white">
                  {t('expense', 'รายจ่าย')}
                </span>
                <span className="text-black dark:text-white text-base">
                  {dayExpense.toLocaleString()}
                </span>
              </div>
            </div>

            <div className={`bg-blue-100 dark:bg-blue-900/20 ${isLastDate ? 'rounded-b-md' : ''}`}>
              {dayTransactions.map((transaction, tIndex) => {
                const isLastTransaction = tIndex === dayTransactions.length - 1;
                const shouldRoundBottom = isLastDate && isLastTransaction;

                return (
                  <div
                    key={transaction.id}
                    className={`flex items-center justify-between px-4 hover:bg-blue-200/50 dark:hover:bg-blue-800/30 h-16 cursor-pointer 
                ${shouldRoundBottom ? 'rounded-b-md' : ''}`}
                    onClick={() => setSelectedTransaction(transaction)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-black-700 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {categoryMap[transaction.categoryId] ? (
                          <Image
                            src={categoryMap[transaction.categoryId]}
                            alt={transaction.description || 'category icon'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200">
                            <MdOutlineNotInterested size={20} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-black dark:text-white text-base flex items-center gap-1">
                          {transaction.type === 'INCOME'
                            ? t('income', 'รายรับ')
                            : t('expense', 'รายจ่าย')}
                          {!categoryMap[transaction.categoryId] && (
                            <span className="text-xs text-gray-500 font-normal">
                              {t('uncategorized_paren', '(ไม่มีหมวดหมู่)')}
                            </span>
                          )}
                        </p>
                        {transaction.description && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1 break-all w-32 md:w-48">
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
                );
              })}
            </div>
          </div>
        );
      })}

      <Modal isOpen={!!selectedTransaction} onClose={handleCloseMainModal}>
        {selectedTransaction && (
          <div
            className="flex justify-center items-center h-full w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-black-800 w-full max-w-[340px] rounded-2xl py-6 px-6 shadow-xl">
              <div className="flex justify-between items-center mb-5">
                <h4 className="font-semibold text-lg dark:text-white">
                  {t('detail_label', 'รายละเอียด')}
                </h4>
                <div
                  onClick={handleCloseMainModal}
                  className="bg-black-300 dark:bg-black-600 flex justify-center items-center rounded-full w-10 h-10 hover:bg-black-400 dark:hover:bg-black-500 cursor-pointer"
                >
                  <RxCross2 size={18} />
                </div>
              </div>

              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full bg-gray-50 dark:bg-black-700 flex items-center justify-center border border-gray-100 dark:border-black-600 overflow-hidden">
                  {categoryMap[selectedTransaction.categoryId] ? (
                    <Image
                      src={categoryMap[selectedTransaction.categoryId]}
                      alt="icon"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                      <MdOutlineNotInterested size={36} />
                    </div>
                  )}
                </div>

                <div className="text-center mb-1">
                  <div
                    className={`text-lg font-bold mb-0.5 flex items-center justify-center gap-1 ${
                      selectedTransaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {selectedTransaction.type === 'INCOME'
                      ? t('income', 'รายรับ')
                      : t('expense', 'รายจ่าย')}
                    {!categoryMap[selectedTransaction.categoryId] && (
                      <span className="text-sm font-normal text-gray-400">
                        {t('uncategorized_paren', '(ไม่มีหมวดหมู่)')}
                      </span>
                    )}
                  </div>
                  <h2
                    className={`text-2xl font-bold ${selectedTransaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {selectedTransaction.type === 'INCOME' ? '+' : '-'}
                    {selectedTransaction.amount.toLocaleString()}
                  </h2>
                </div>

                <div className="w-full mt-1">
                  {selectedTransaction.description ? (
                    <div className="flex gap-2 items-start bg-gray-50 dark:bg-black-700 rounded-xl p-3">
                      <div className="text-gray-400 mt-0.5 flex-shrink-0">
                        <MdSubject size={16} />
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed break-words text-left">
                        {selectedTransaction.description}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center gap-3 mt-5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDeleteModalOpen(true);
                  }}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl bg-[#FF2D55] text-white text-sm font-semibold hover:bg-[#f91e46] transition disabled:opacity-50"
                >
                  {isDeleting ? t('deleting', 'กำลังลบ...') : t('delete', 'ลบ')}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit();
                  }}
                  className="flex-1 bg-blue-600 py-2.5 rounded-xl text-white text-sm font-semibold hover:bg-blue-700 transition"
                >
                  {t('edit_btn', 'แก้ไข')}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleDelete}
        title={t('delete_transaction_confirm', 'ต้องการลบรายการนี้ใช่หรือไม่?')}
        confirmText={
          isDeleting ? t('deleting', 'กำลังลบ...') : t('yes_delete_confirm', 'ใช่ ลบเลย')
        }
        cancelText={t('cancel_btn', 'ยกเลิก')}
      />
    </div>
  );
};

export default DayTransactions;
