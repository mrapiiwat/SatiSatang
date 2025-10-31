import React from 'react';

export interface ManualProps {
  onClose: () => void;
  onSuccess: () => void;
}

export interface UploadProps {
  onClose: () => void;
}

export interface BudgetProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export interface GoalProps {
  onClose: () => void;
}

export interface AddMenuProps {
  isOpen: boolean;
  onSelect: (type: string) => void;
  onClose: () => void;
}

export interface CategoryResponse {
  id: number;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  userId: number;
  iconId: string;
  isGoal?: boolean;
}

export interface OptionType {
  value: string;
  label: string;
}

export interface Transaction {
  id: number;
  type: 'INCOME' | 'EXPENSE';
  description: string;
  amount: number;
  createdAt: string;
  categoryId: number;
}

export interface DayTransactionsProps {
  groupedByDate: Record<number, Transaction[]>;
  sortedDates: number[];
}

export interface CategoryOption {
  value: number;
  label: string;
  isGoal?: boolean;
}

export interface FrequencyOption {
  value: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  label: string;
}

export type CategoriesType = {
  id: number;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon: string;
};

export interface CategoryHeaderProps {
  selectedType: 'INCOME' | 'EXPENSE';
  setSelectedType: (type: 'INCOME' | 'EXPENSE') => void;
}

export interface CategoryListProps {
  categories: CategoriesType[];
  setCategories: React.Dispatch<React.SetStateAction<CategoriesType[]>>;
  onAddClick: () => void;
}

export interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedType: 'INCOME' | 'EXPENSE';
  refresh: () => Promise<void>;
}

export interface Icon {
  id: number;
  url: string;
  description: string;
}

export interface IconSelectorProps {
  selectedIconId: string;
  selectedIconUrl?: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

export interface FloatingBubbleProps {
  onClick?: () => void;
}

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
