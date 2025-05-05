
export type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  createdAt: Date;
};

export type Account = {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  userId: string;
  color?: string;
  icon?: string;
};

export type Transaction = {
  id: string;
  date: Date;
  amount: number;
  description: string;
  category: Category;
  accountId: string;
  type: TransactionType;
  isRecurring?: boolean;
  tags?: string[];
};

export type Category = {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
  icon?: string;
};

export type Bill = {
  id: string;
  name: string;
  amount: number;
  dueDate: Date;
  isRecurring: boolean;
  category?: Category;
  isPaid: boolean;
};

export type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: Date;
  color?: string;
};

export type BudgetCategory = {
  categoryId: string;
  allocated: number;
  spent: number;
};

export type Budget = {
  id: string;
  month: number;
  year: number;
  totalAllocated: number;
  totalSpent: number;
  categories: BudgetCategory[];
};

export type AccountType = 'Checking' | 'Savings' | 'Credit' | 'Investment' | 'Cash' | 'Other';

export type TransactionType = 'income' | 'expense' | 'transfer';

export type CategoryType = 'income' | 'expense';

export type Notification = {
  id: string;
  type: 'bill' | 'balance' | 'transaction' | 'insight';
  message: string;
  read: boolean;
  date: Date;
};

export type UserPreferences = {
  currency: string;
  dateFormat: string;
  darkMode: boolean;
  notifications: {
    lowBalance: boolean;
    billReminders: boolean;
    largeTransactions: boolean;
    weeklySummary: boolean;
    aiInsights: boolean;
  };
};
