import React, { useEffect, useState } from 'react';
import type { DayTransactionsProps } from '../../../interface/home';
import type { CategoriesType, Transaction } from '../../../interface/category';
import Image from '../../Image';
import axios from '../../../api/axios';
import Modal from '../../Modal';
import { MdDelete, MdEdit, MdClose } from 'react-icons/md';
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
          <div className="p-8 font-ibm text-black-900">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-bold text-black-900">รายละเอียดรายการ</h3>
                <p className="text-sm text-black-500 mt-1">จัดการข้อมูลธุรกรรมของคุณ</p>
              </div>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="p-2 hover:bg-black-200 rounded-full transition-colors text-black-500"
              >
                <MdClose size={24} />
              </button>
            </div>

            <div className="bg-white border border-black-300 rounded-2xl p-6 mb-8 shadow-sm">
              <div className="flex flex-col gap-5">
                <div className="flex justify-between items-center">
                  <span className="text-black-600 font-medium">ประเภท</span>
                  <span
                    className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      selectedTransaction.type === 'INCOME'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-red-100 text-red-500'
                    }`}
                  >
                    {selectedTransaction.type === 'INCOME' ? 'รายรับ' : 'รายจ่าย'}
                  </span>
                </div>

                <hr className="border-black-200" />

                <div className="flex justify-between items-center">
                  <span className="text-black-600 font-medium">จำนวนเงิน</span>
                  <span
                    className={`text-2xl font-bold ${
                      selectedTransaction.type === 'INCOME' ? 'text-blue-600' : 'text-red-500'
                    }`}
                  >
                    {selectedTransaction.type === 'INCOME' ? '+' : '-'}{' '}
                    {selectedTransaction.amount.toLocaleString()}{' '}
                    <span className="text-sm ml-1 font-semibold text-black-500">บาท</span>
                  </span>
                </div>

                <hr className="border-black-200" />

                <div className="flex flex-col gap-2">
                  <span className="text-black-600 font-medium">บันทึกเพิ่มเติม</span>
                  <p className="text-black-800 bg-gray-50 p-3 rounded-lg border border-dashed border-black-300 text-sm italic">
                    {selectedTransaction.description || 'ไม่มีบันทึกเพิ่มเติม'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => handleEdit()}
                className="flex-1 flex items-center justify-center gap-2 border-2 border-blue-600 text-blue-600 py-3.5 rounded-2xl font-bold hover:bg-blue-50 active:scale-95 transition-all"
              >
                <MdEdit size={20} /> แก้ไขข้อมูล
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-3.5 rounded-2xl font-bold hover:bg-red-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-red-200"
              >
                {isDeleting ? (
                  <span className="animate-pulse">กำลังลบ...</span>
                ) : (
                  <>
                    <MdDelete size={20} /> ลบรายการ
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
