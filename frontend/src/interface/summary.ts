export interface Transaction {
  id: number;
  type: 'INCOME' | 'EXPENSE';
  description: string;
  amount: number;
  date: string;
  category: {
    id: number;
    name: string;
    type: 'INCOME' | 'EXPENSE';
    iconId: number;
  };
}

export interface Goal {
  id: number;
  name: string;
  amount: number;
  currentAmount: number;
  deadline?: string;
  createdAt: string;
}
