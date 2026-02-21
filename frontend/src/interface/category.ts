import React from 'react';

export interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedType: 'INCOME' | 'EXPENSE';
  refresh: () => Promise<void>;
}

export interface CategoryHeaderProps {
  selectedType: 'INCOME' | 'EXPENSE';
  setSelectedType: (type: 'INCOME' | 'EXPENSE') => void;
}

export type CategoriesType = {
  id: number;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  iconId: number;
  icon: string;
  deletedAt: string | null;
};

export interface CategoryListProps {
  categories: CategoriesType[];
  setCategories: React.Dispatch<React.SetStateAction<CategoriesType[]>>;
  onAddClick: () => void;
  refresh?: () => void;
}

export interface Transaction {
  id: number;
  type: 'INCOME' | 'EXPENSE';
  description: string;
  amount: number;
  createdAt: string;
  categoryId: number;
}
