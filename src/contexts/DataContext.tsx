import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import {
  Account,
  Transaction,
  Category,
  Bill,
  SavingsGoal,
  Budget,
  Notification,
  UserPreferences,
} from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./AuthContext";
import { toast } from "@/components/ui/sonner";

interface DataContextType {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  bills: Bill[];
  savingsGoals: SavingsGoal[];
  budgets: Budget[];
  notifications: Notification[];
  preferences: UserPreferences;
  addAccount: (account: Omit<Account, "id" | "userId">) => Promise<boolean>;
  updateAccount: (id: string, account: Partial<Account>) => Promise<boolean>;
  deleteAccount: (id: string) => Promise<boolean>;
  addTransaction: (transaction: Omit<Transaction, "id">) => Promise<boolean>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<boolean>;
  deleteTransaction: (id: string) => Promise<boolean>;
  addSavingsGoal: (goal: Omit<SavingsGoal, "id">) => Promise<boolean>;
  updateSavingsGoal: (id: string, goal: Partial<SavingsGoal>) => Promise<boolean>;
  deleteSavingsGoal: (id: string) => Promise<boolean>;
  addBill: (bill: Omit<Bill, "id">) => Promise<boolean>;
  updateBill: (id: string, bill: Partial<Bill>) => Promise<boolean>;
  deleteBill: (id: string) => Promise<boolean>;
  addCategory: (category: Category) => Promise<boolean>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
  updatePreferences: (newPreferences: Partial<UserPreferences>) => Promise<boolean>;
  markNotificationAsRead: (id: string) => Promise<boolean>;
  calculateTotalBalance: () => number;
  calculateNetIncome: () => number;
  transferBetweenAccounts: (fromAccountId: string, toAccountId: string, amount: number, fee?: number, description?: string) => Promise<boolean>;
  fundSavingsGoal: (goalId: string, accountId: string, amount: number) => Promise<boolean>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Mock data
const mockCategories: Category[] = [
  { id: "cat-1", name: "Housing", type: "expense", color: "#ef4444" },
  { id: "cat-2", name: "Groceries", type: "expense", color: "#22c55e" },
  { id: "cat-3", name: "Dining", type: "expense", color: "#f97316" },
  { id: "cat-4", name: "Transportation", type: "expense", color: "#3b82f6" },
  { id: "cat-5", name: "Entertainment", type: "expense", color: "#9b87f5" },
  { id: "cat-6", name: "Utilities", type: "expense", color: "#64748b" },
  { id: "cat-7", name: "Healthcare", type: "expense", color: "#0ea5e9" },
  { id: "cat-8", name: "Shopping", type: "expense", color: "#8b5cf6" },
  { id: "cat-9", name: "Gifts", type: "expense", color: "#9333ea" },
  { id: "cat-10", name: "Salary", type: "income", color: "#22c55e" },
  { id: "cat-11", name: "Investments", type: "income", color: "#3b82f6" },
  { id: "cat-12", name: "Transfer", type: "expense", color: "#64748b" },
];

const mockAccounts: Account[] = [
  { id: "acc-1", name: "Main Checking", type: "Checking", balance: 3500, userId: "user-123" },
  { id: "acc-2", name: "Savings", type: "Savings", balance: 12500, userId: "user-123" },
  { id: "acc-3", name: "Credit Card", type: "Credit", balance: -1500, userId: "user-123" },
  { id: "acc-4", name: "Investment", type: "Investment", balance: 45000, userId: "user-123" },
];

const mockTransactions: Transaction[] = [
  {
    id: "trans-1",
    date: new Date(2025, 4, 3),
    amount: 250,
    description: "Dividend payment",
    category: mockCategories[10],
    accountId: "acc-4",
    type: "income",
  },
  {
    id: "trans-2",
    date: new Date(2025, 4, 2),
    amount: -45,
    description: "Dinner at Italian restaurant",
    category: mockCategories[2],
    accountId: "acc-3",
    type: "expense",
  },
  {
    id: "trans-3",
    date: new Date(2025, 4, 2),
    amount: 100,
    description: "Birthday gift",
    category: mockCategories[8],
    accountId: "acc-2",
    type: "income",
  },
  {
    id: "trans-4",
    date: new Date(2025, 4, 1),
    amount: -85.75,
    description: "Grocery shopping",
    category: mockCategories[1],
    accountId: "acc-1",
    type: "expense",
  },
  {
    id: "trans-5",
    date: new Date(2025, 4, 1),
    amount: -1200,
    description: "Rent payment",
    category: mockCategories[0],
    accountId: "acc-1",
    type: "expense",
  },
  {
    id: "trans-6",
    date: new Date(2025, 4, 1),
    amount: 3500,
    description: "Salary deposit",
    category: mockCategories[9],
    accountId: "acc-1",
    type: "income",
  },
  {
    id: "trans-7",
    date: new Date(2025, 3, 30),
    amount: -42.50,
    description: "Pharmacy",
    category: mockCategories[6],
    accountId: "acc-3",
    type: "expense",
  },
];

const mockBills: Bill[] = [
  {
    id: "bill-1",
    name: "Internet",
    amount: 75,
    dueDate: new Date(2025, 4, 15),
    isRecurring: true,
    isPaid: false,
  },
  {
    id: "bill-2",
    name: "Phone Bill",
    amount: 85,
    dueDate: new Date(2025, 4, 18),
    isRecurring: true,
    isPaid: false,
  },
  {
    id: "bill-3",
    name: "Electric Bill",
    amount: 125,
    dueDate: new Date(2025, 4, 20),
    isRecurring: true,
    isPaid: false,
  },
  {
    id: "bill-4",
    name: "Rent",
    amount: 1200,
    dueDate: new Date(2025, 5, 1),
    isRecurring: true,
    isPaid: false,
  },
];

const mockSavingsGoals: SavingsGoal[] = [
  {
    id: "goal-1",
    name: "Vacation",
    targetAmount: 3000,
    currentAmount: 1200,
    targetDate: new Date(2025, 11, 31),
    color: "#3b82f6",
  },
  {
    id: "goal-2",
    name: "Emergency Fund",
    targetAmount: 10000,
    currentAmount: 4500,
    color: "#22c55e",
  },
  {
    id: "goal-3",
    name: "New Laptop",
    targetAmount: 1500,
    currentAmount: 800,
    targetDate: new Date(2025, 7, 15),
    color: "#9b87f5",
  },
];

const mockBudgets: Budget[] = [
  {
    id: "budget-1",
    month: 5,
    year: 2025,
    totalAllocated: 2600,
    totalSpent: 1648.74,
    categories: [
      { categoryId: "cat-1", allocated: 1200, spent: 1200 },
      { categoryId: "cat-5", allocated: 100, spent: 65.99 },
      { categoryId: "cat-8", allocated: 150, spent: 89.50 },
      { categoryId: "cat-7", allocated: 100, spent: 42.00 },
      { categoryId: "cat-6", allocated: 300, spent: 120.50 },
    ],
  },
];

const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    type: "insight",
    message: "Your spending on dining out has increased by 30% compared to last month.",
    read: false,
    date: new Date(),
  },
  {
    id: "notif-2",
    type: "bill",
    message: "You have 3 bills due within the next 7 days totaling ₹285.",
    read: false,
    date: new Date(),
  },
  {
    id: "notif-3",
    type: "insight",
    message: "Based on your spending habits, you could save ₹150 more each month by reducing entertainment expenses.",
    read: false,
    date: new Date(),
  },
  {
    id: "notif-4",
    type: "insight",
    message: "Based on your history, we expect you'll need to pay for car insurance next month (~₹180).",
    read: false,
    date: new Date(),
  },
];

const defaultPreferences: UserPreferences = {
  currency: "INR",
  dateFormat: "MM/DD/YYYY",
  darkMode: false,
  notifications: {
    lowBalance: true,
    billReminders: true,
    largeTransactions: true,
    weeklySummary: false,
    aiInsights: true,
  },
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast: hookToast } = useToast();

  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [bills, setBills] = useState<Bill[]>(mockBills);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(mockSavingsGoals);
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgets);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);

  // In a real app, we'd fetch this data from MySQL when the user logs in
  useEffect(() => {
    if (user) {
      // Mock data is already loaded
      console.log("User logged in, data loaded");
    } else {
      // Reset data when user logs out
      setAccounts([]);
      setTransactions([]);
      setBills([]);
      setSavingsGoals([]);
      setBudgets([]);
      setNotifications([]);
      setPreferences(defaultPreferences);
    }
  }, [user]);

  const addAccount = async (account: Omit<Account, "id" | "userId">): Promise<boolean> => {
    try {
      if (user) {
        const newAccount: Account = {
          ...account,
          id: `acc-${Date.now()}`,
          userId: user.id,
        };
        setAccounts([...accounts, newAccount]);
        
        toast.success("Account added", {
          description: `${newAccount.name} has been added successfully`,
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Add account error:", error);
      
      toast.error("Failed to add account", {
        description: "An error occurred while adding the account",
      });
      
      return false;
    }
  };

  const updateAccount = async (id: string, account: Partial<Account>): Promise<boolean> => {
    try {
      const index = accounts.findIndex((a) => a.id === id);
      if (index >= 0) {
        const updatedAccounts = [...accounts];
        updatedAccounts[index] = { ...updatedAccounts[index], ...account };
        setAccounts(updatedAccounts);
        
        toast.success("Account updated", {
          description: `${updatedAccounts[index].name} has been updated`,
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Update account error:", error);
      
      toast.error("Failed to update account", {
        description: "An error occurred while updating the account",
      });
      
      return false;
    }
  };

  const deleteAccount = async (id: string): Promise<boolean> => {
    try {
      const accountToDelete = accounts.find(a => a.id === id);
      if (accountToDelete) {
        // Check if there are transactions linked to this account
        const hasTransactions = transactions.some(t => t.accountId === id);
        
        if (hasTransactions) {
          toast.error("Cannot delete account", {
            description: "This account has transactions linked to it. Delete the transactions first or move them to another account.",
          });
          return false;
        }
        
        setAccounts(accounts.filter((a) => a.id !== id));
        
        toast.success("Account deleted", {
          description: `${accountToDelete.name} has been removed`,
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Delete account error:", error);
      
      toast.error("Failed to delete account", {
        description: "An error occurred while deleting the account",
      });
      
      return false;
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, "id">): Promise<boolean> => {
    try {
      const newTransaction: Transaction = {
        ...transaction,
        id: `trans-${Date.now()}`,
      };
      
      setTransactions([newTransaction, ...transactions]);
      
      // Update account balance
      if (transaction.type === "expense") {
        updateAccount(transaction.accountId, {
          balance: accounts.find((a) => a.id === transaction.accountId)!.balance - Math.abs(transaction.amount),
        });
      } else if (transaction.type === "income") {
        updateAccount(transaction.accountId, {
          balance: accounts.find((a) => a.id === transaction.accountId)!.balance + transaction.amount,
        });
      }
      
      toast.success("Transaction added", {
        description: "Transaction has been recorded successfully",
      });
      
      return true;
    } catch (error) {
      console.error("Add transaction error:", error);
      
      toast.error("Failed to add transaction", {
        description: "An error occurred while adding the transaction",
      });
      
      return false;
    }
  };

  const updateTransaction = async (id: string, transaction: Partial<Transaction>): Promise<boolean> => {
    try {
      const index = transactions.findIndex((t) => t.id === id);
      if (index >= 0) {
        const updatedTransactions = [...transactions];
        updatedTransactions[index] = { ...updatedTransactions[index], ...transaction };
        setTransactions(updatedTransactions);
        
        toast.success("Transaction updated", {
          description: "Transaction has been updated successfully",
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Update transaction error:", error);
      
      toast.error("Failed to update transaction", {
        description: "An error occurred while updating the transaction",
      });
      
      return false;
    }
  };

  const deleteTransaction = async (id: string): Promise<boolean> => {
    try {
      const transactionToDelete = transactions.find(t => t.id === id);
      if (transactionToDelete) {
        // Update account balance to reverse transaction effect
        if (transactionToDelete.type === "expense") {
          updateAccount(transactionToDelete.accountId, {
            balance: accounts.find((a) => a.id === transactionToDelete.accountId)!.balance + Math.abs(transactionToDelete.amount),
          });
        } else if (transactionToDelete.type === "income") {
          updateAccount(transactionToDelete.accountId, {
            balance: accounts.find((a) => a.id === transactionToDelete.accountId)!.balance - transactionToDelete.amount,
          });
        }
        
        setTransactions(transactions.filter((t) => t.id !== id));
        
        toast.success("Transaction deleted", {
          description: "Transaction has been removed successfully",
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Delete transaction error:", error);
      
      toast.error("Failed to delete transaction", {
        description: "An error occurred while deleting the transaction",
      });
      
      return false;
    }
  };

  const addSavingsGoal = async (goal: Omit<SavingsGoal, "id">): Promise<boolean> => {
    try {
      const newGoal: SavingsGoal = {
        ...goal,
        id: `goal-${Date.now()}`,
      };
      
      setSavingsGoals([...savingsGoals, newGoal]);
      
      toast.success("Savings goal added", {
        description: `${newGoal.name} goal has been created successfully`,
      });
      
      return true;
    } catch (error) {
      console.error("Add savings goal error:", error);
      
      toast.error("Failed to add savings goal", {
        description: "An error occurred while adding the savings goal",
      });
      
      return false;
    }
  };

  const updateSavingsGoal = async (id: string, goal: Partial<SavingsGoal>): Promise<boolean> => {
    try {
      const index = savingsGoals.findIndex((g) => g.id === id);
      if (index >= 0) {
        const updatedGoals = [...savingsGoals];
        updatedGoals[index] = { ...updatedGoals[index], ...goal };
        setSavingsGoals(updatedGoals);
        
        toast.success("Savings goal updated", {
          description: `${updatedGoals[index].name} has been updated`,
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Update savings goal error:", error);
      
      toast.error("Failed to update savings goal", {
        description: "An error occurred while updating the savings goal",
      });
      
      return false;
    }
  };

  const deleteSavingsGoal = async (id: string): Promise<boolean> => {
    try {
      const goalToDelete = savingsGoals.find(g => g.id === id);
      if (goalToDelete) {
        setSavingsGoals(savingsGoals.filter((g) => g.id !== id));
        
        toast.success("Savings goal deleted", {
          description: `${goalToDelete.name} has been removed`,
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Delete savings goal error:", error);
      
      toast.error("Failed to delete savings goal", {
        description: "An error occurred while deleting the savings goal",
      });
      
      return false;
    }
  };

  const addBill = async (bill: Omit<Bill, "id">): Promise<boolean> => {
    try {
      const newBill: Bill = {
        ...bill,
        id: `bill-${Date.now()}`,
      };
      
      setBills([...bills, newBill]);
      
      toast.success("Bill added", {
        description: `${newBill.name} has been added to your bills`,
      });
      
      return true;
    } catch (error) {
      console.error("Add bill error:", error);
      
      toast.error("Failed to add bill", {
        description: "An error occurred while adding the bill",
      });
      
      return false;
    }
  };

  const updateBill = async (id: string, bill: Partial<Bill>): Promise<boolean> => {
    try {
      const index = bills.findIndex((b) => b.id === id);
      if (index >= 0) {
        const updatedBills = [...bills];
        updatedBills[index] = { ...updatedBills[index], ...bill };
        setBills(updatedBills);
        
        toast.success("Bill updated", {
          description: `${updatedBills[index].name} has been updated`,
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Update bill error:", error);
      
      toast.error("Failed to update bill", {
        description: "An error occurred while updating the bill",
      });
      
      return false;
    }
  };

  const deleteBill = async (id: string): Promise<boolean> => {
    try {
      const billToDelete = bills.find(b => b.id === id);
      if (billToDelete) {
        setBills(bills.filter((b) => b.id !== id));
        
        toast.success("Bill deleted", {
          description: `${billToDelete.name} has been removed from your bills`,
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Delete bill error:", error);
      
      toast.error("Failed to delete bill", {
        description: "An error occurred while deleting the bill",
      });
      
      return false;
    }
  };

  const addCategory = async (category: Category): Promise<boolean> => {
    try {
      setCategories([...categories, category]);
      
      toast.success("Category added", {
        description: `${category.name} category has been added successfully`,
      });
      
      return true;
    } catch (error) {
      console.error("Add category error:", error);
      
      toast.error("Failed to add category", {
        description: "An error occurred while adding the category",
      });
      
      return false;
    }
  };

  const updateCategory = async (id: string, category: Partial<Category>): Promise<boolean> => {
    try {
      const index = categories.findIndex((c) => c.id === id);
      if (index >= 0) {
        const updatedCategories = [...categories];
        updatedCategories[index] = { ...updatedCategories[index], ...category };
        setCategories(updatedCategories);
        
        // Also update any transactions using this category
        const updatedTransactions = transactions.map(transaction => {
          if (transaction.category.id === id) {
            return {
              ...transaction,
              category: updatedCategories[index]
            };
          }
          return transaction;
        });
        setTransactions(updatedTransactions);
        
        toast.success("Category updated", {
          description: `${updatedCategories[index].name} has been updated`,
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Update category error:", error);
      
      toast.error("Failed to update category", {
        description: "An error occurred while updating the category",
      });
      
      return false;
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    try {
      // Check if category is being used in transactions
      const categoryInUse = transactions.some(t => t.category.id === id);
      if (categoryInUse) {
        toast.error("Cannot delete category", {
          description: "This category is being used by transactions. Please reassign those transactions first.",
        });
        return false;
      }
      
      const categoryToDelete = categories.find(c => c.id === id);
      if (categoryToDelete) {
        setCategories(categories.filter((c) => c.id !== id));
        
        toast.success("Category deleted", {
          description: `${categoryToDelete.name} has been removed`,
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Delete category error:", error);
      
      toast.error("Failed to delete category", {
        description: "An error occurred while deleting the category",
      });
      
      return false;
    }
  };

  const updatePreferences = async (newPreferences: Partial<UserPreferences>): Promise<boolean> => {
    try {
      const updatedPreferences = { ...preferences, ...newPreferences };
      setPreferences(updatedPreferences);
      
      toast.success("Preferences updated", {
        description: "Your preferences have been updated successfully",
      });
      
      return true;
    } catch (error) {
      console.error("Update preferences error:", error);
      
      toast.error("Failed to update preferences", {
        description: "An error occurred while updating your preferences",
      });
      
      return false;
    }
  };

  const markNotificationAsRead = async (id: string): Promise<boolean> => {
    try {
      const index = notifications.findIndex((n) => n.id === id);
      if (index >= 0) {
        const updatedNotifications = [...notifications];
        updatedNotifications[index] = { ...updatedNotifications[index], read: true };
        setNotifications(updatedNotifications);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Mark notification error:", error);
      return false;
    }
  };

  const calculateTotalBalance = (): number => {
    return accounts.reduce((total, account) => total + account.balance, 0);
  };

  const calculateNetIncome = (): number => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const monthTransactions = transactions.filter(
      (t) => t.date.getMonth() === currentMonth && t.date.getFullYear() === currentYear
    );

    const income = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((total, t) => total + t.amount, 0);

    const expenses = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((total, t) => total + Math.abs(t.amount), 0);

    return income - expenses;
  };

  // Function to transfer between accounts
  const transferBetweenAccounts = async (
    fromAccountId: string, 
    toAccountId: string, 
    amount: number, 
    fee: number = 0, 
    description: string = "Transfer between accounts"
  ): Promise<boolean> => {
    try {
      const fromAccount = accounts.find(a => a.id === fromAccountId);
      const toAccount = accounts.find(a => a.id === toAccountId);
      
      if (!fromAccount || !toAccount) {
        toast.error("Transfer failed", {
          description: "One or both accounts not found",
        });
        return false;
      }
      
      if (fromAccount.balance < amount + fee) {
        toast.error("Transfer failed", {
          description: "Insufficient funds in the source account",
        });
        return false;
      }
      
      // Create transaction for the transfer out
      await addTransaction({
        date: new Date(),
        amount: -(amount + fee),
        description: `Transfer to ${toAccount.name}${fee > 0 ? ` (includes ${formatCurrency(fee)} fee)` : ''}`,
        category: categories.find(c => c.id === "cat-12")!, // Transfer category
        accountId: fromAccountId,
        type: "transfer",
      });
      
      // Create transaction for the transfer in
      await addTransaction({
        date: new Date(),
        amount: amount,
        description: `Transfer from ${fromAccount.name}`,
        category: categories.find(c => c.id === "cat-12")!, // Transfer category
        accountId: toAccountId,
        type: "transfer",
      });
      
      // Update account balances
      await updateAccount(fromAccountId, {
        balance: fromAccount.balance - amount - fee,
      });
      
      await updateAccount(toAccountId, {
        balance: toAccount.balance + amount,
      });
      
      toast.success("Transfer completed", {
        description: `Successfully transferred ${formatCurrency(amount)} from ${fromAccount.name} to ${toAccount.name}`,
      });
      
      return true;
    } catch (error) {
      console.error("Transfer error:", error);
      
      toast.error("Transfer failed", {
        description: "An error occurred while processing the transfer",
      });
      
      return false;
    }
  };

  // Function to fund a savings goal from an account
  const fundSavingsGoal = async (
    goalId: string, 
    accountId: string, 
    amount: number
  ): Promise<boolean> => {
    try {
      const goal = savingsGoals.find(g => g.id === goalId);
      const account = accounts.find(a => a.id === accountId);
      
      if (!goal || !account) {
        toast.error("Funding failed", {
          description: "Goal or account not found",
        });
        return false;
      }
      
      if (account.balance < amount) {
        toast.error("Funding failed", {
          description: "Insufficient funds in the selected account",
        });
        return false;
      }
      
      // Create transaction for the funding
      await addTransaction({
        date: new Date(),
        amount: -amount,
        description: `Contribution to ${goal.name} goal`,
        category: categories.find(c => c.name === "Savings" || c.id === "cat-6") || categories[0],
        accountId: accountId,
        type: "expense",
      });
      
      // Update account balance
      await updateAccount(accountId, {
        balance: account.balance - amount,
      });
      
      // Update goal progress
      await updateSavingsGoal(goalId, {
        currentAmount: goal.currentAmount + amount,
      });
      
      toast.success("Goal funded", {
        description: `Added ${formatCurrency(amount)} to your ${goal.name} goal`,
      });
      
      return true;
    } catch (error) {
      console.error("Fund goal error:", error);
      
      toast.error("Funding failed", {
        description: "An error occurred while funding the goal",
      });
      
      return false;
    }
  };

  return (
    <DataContext.Provider
      value={{
        accounts,
        transactions,
        categories,
        bills,
        savingsGoals,
        budgets,
        notifications,
        preferences,
        addAccount,
        updateAccount,
        deleteAccount,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        addBill,
        updateBill,
        deleteBill,
        addCategory,
        updateCategory,
        deleteCategory,
        updatePreferences,
        markNotificationAsRead,
        calculateTotalBalance,
        calculateNetIncome,
        transferBetweenAccounts,
        fundSavingsGoal,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  
  return context;
};
