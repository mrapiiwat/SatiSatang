export interface ManualProps {
  onClose: () => void;
  onSuccess: () => void;
}
export interface UploadProps {
  onClose: () => void;
}
export interface BudgetProps {
  onClose: () => void;
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
}

export interface DayTransactionsProps {
  transactions: Transaction[];
}
