import React from 'react';
import type { SingleValue } from 'react-select';

export interface ManualProps {
  onClose: () => void;
  onSuccess: () => void;
  editData?: Transaction | DraftData | null;
  onUpdateDraft?: (data: DraftData) => void;
}

export interface UploadProps {
  onClose: () => void;
}

export interface BudgetProps {
  onClose: () => void;
  onSuccess?: () => void;
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

export interface Transaction {
  id: number;
  type: 'INCOME' | 'EXPENSE';
  description: string;
  amount: number;
  date: string;
  categoryId: number;
  receipt?: string | null;
  fromAccount?: string | null;
  toAccount?: string | null;
}

export interface DayTransactionsProps {
  groupedByDate: Record<number, Transaction[]>;
  sortedDates: number[];
  onRefresh: () => void;
  onEdit?: (transaction: Transaction) => void;
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

export interface FloatingBubbleProps {
  onClick?: () => void;
}

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OptionType {
  value: string;
  label: string;
}

export interface CategoryOptions {
  value: string;
  label: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface PendingTransaction {
  id: string;
  fileIndex: number;
  data: {
    date: string;
    description: string;
    type: string;
    categoryId: string;
    amount: string;
    fromAccount: string;
    toAccount: string;
  };
}

interface AIExctractedData {
  date?: string;
  description?: string;
  type?: string;
  categoryId?: string | number;
  amount?: string | number;
  fromAccount?: string;
  toAccount?: string;
}

export interface UploadResult {
  status: 'success' | 'error';
  fileName: string;
  data?: AIExctractedData;
  error?: string;
}

export interface FileUploadProps {
  files: File[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
}

export interface TransactionFormProps {
  transactionData: {
    date: string;
    description: string;
    type: string;
    categoryId: string;
    amount: string;
    fromAccount: string;
    toAccount: string;
  };
  selectedTypeOption: OptionType | null;
  selectedCategoryOption: CategoryOptions | null;
  categories: CategoryOptions[];
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (name: string, option: SingleValue<OptionType | CategoryOptions>) => void;
  onSave: () => void;
}

export interface SlipPreviewProps {
  transactionData: {
    fromAccount: string;
    toAccount: string;
  };
  previewUrl: string | null;
  onPreviewClick: () => void;
}

export interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  previewUrl: string | null;
}

export interface SatiProps {
  handleCloseChatModal: () => void;
  isMenuOpen: boolean;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleMenuSelect: (type: string) => void;
  onRefresh?: () => void;
  onSwitchToSatang?: () => void;
}

export interface GoalTransaction {
  id: number;
  goalId: number;
  userId: number;
  amount: number;
  createdAt: string;
}

export interface MyGoal {
  id: number;
  name: string;
  amount: number;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  goalTransactions: GoalTransaction[];
  currentAmount: number;
  totalAmount: number;
  finished: boolean;
}

export interface MyBudget {
  id: number;
  amount: number;
  currentAmount: number;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  userId: number;
  category: {
    id: number;
    name: string;
  };
  deadline: string;
}

export interface DeadlineDisplayProps {
  deadline?: string | Date | null;
  now: Date;
}

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface DraftData {
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  date: string;
  description: string;
  category?: string;
  categoryId: number;
  isGoal?: boolean;
  receipt?: string | null;
  fromAccount?: string | null;
  toAccount?: string | null;
}

export interface CategoryType {
  id: number;
  name: string;
  icon: string;
}

export type DraftStatus = 'pending' | 'confirmed' | 'cancelled';

export interface BudgetDraftData {
  id?: number;
  amount: number;
  categoryId: number;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
}

export interface GoalDraftData {
  name: string;
  amount: number;
  deadline?: string | null;
  status?: DraftStatus;
}

export interface GoalProps {
  onClose: () => void;
  onSuccess?: () => void;
  editData?: GoalDraftData;
  onUpdateDraft?: (data: GoalDraftData) => Promise<void>;
}

export interface MessageContentData {
  data: {
    status?: DraftStatus;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export type EditingDraftType = DraftData | BudgetDraftData | GoalDraftData | null;
