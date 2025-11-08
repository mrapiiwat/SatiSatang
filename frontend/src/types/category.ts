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
  icon: string;
};

export interface CategoryListProps {
  categories: CategoriesType[];
  setCategories: React.Dispatch<React.SetStateAction<CategoriesType[]>>;
  onAddClick: () => void;
}