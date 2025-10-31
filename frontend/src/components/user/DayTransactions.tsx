import React, { useEffect, useState } from 'react';
import type { DayTransactionsProps, CategoriesType } from '../../types/home';
import Image from '../Image';
import axios from '../../api/axios';

const DayTransactions: React.FC<DayTransactionsProps> = ({ groupedByDate, sortedDates }) => {
  const [categoryMap, setCategoryMap] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/categories', { withCredentials: true });
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
                <div key={transaction.id} className="flex items-center justify-between px-4 h-16">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
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
          </div>
        );
      })}
    </div>
  );
};

export default DayTransactions;
