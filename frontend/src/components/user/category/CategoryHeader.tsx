import React from 'react';
import { useRef, useEffect } from 'react';
import type { CategoryHeaderProps } from '../../../interface/category';
import { useTranslation } from 'react-i18next';

const CategoryHeader: React.FC<CategoryHeaderProps> = ({ selectedType, setSelectedType }) => {
  const { t } = useTranslation();
  const incomeRef = useRef<HTMLButtonElement>(null);
  const expenseRef = useRef<HTMLButtonElement>(null);
  const underlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentButton = selectedType === 'INCOME' ? incomeRef.current : expenseRef.current;
    const underline = underlineRef.current;

    if (currentButton && underline) {
      const rect = currentButton.getBoundingClientRect();
      const parentRect = currentButton.parentElement!.getBoundingClientRect();
      underline.style.width = `${rect.width}px`;
      underline.style.left = `${rect.left - parentRect.left}px`;
    }
  }, [selectedType]);

  return (
    <div className="relative flex justify-center gap-8 mb-8">
      <div
        ref={underlineRef}
        className="absolute bottom-0 h-[2px] bg-black-900 transition-all duration-300 ease-in-out"
      ></div>

      <button
        ref={incomeRef}
        onClick={() => setSelectedType('INCOME')}
        className={`pb-1 text-base transition-colors ${
          selectedType === 'INCOME' ? 'font-semibold text-black-900' : 'text-gray-400'
        }`}
      >
        {t('income_label', 'รายรับ')}
      </button>

      <button
        ref={expenseRef}
        onClick={() => setSelectedType('EXPENSE')}
        className={`pb-1 text-base transition-colors ${
          selectedType === 'EXPENSE' ? 'font-semibold text-black-900' : 'text-gray-400'
        }`}
      >
        {t('expense_label', 'รายจ่าย')}
      </button>
    </div>
  );
};

export default CategoryHeader;
