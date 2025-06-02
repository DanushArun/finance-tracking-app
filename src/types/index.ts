// Partner/User Types
export interface Partner {
  id?: string;
  name: string;
  email?: string;
  photoURL?: string;
}

// Transaction Types
export type TransactionType = "income" | "expense";
export type RecurringInterval = "daily" | "weekly" | "monthly" | "yearly";

export interface Transaction {
  id?: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  categoryId: string;
  date: string;
  user: string;
  userId: string;
  coupleId: string;
  isShared: boolean;
  createdAt?: string;
  tags?: string[];
  isRecurring?: boolean;
  recurringInterval?: RecurringInterval;
  receipt?: string;
  location?: string;
  items?: ReceiptItem[];
  notes?: string;
}

// Category Types
export interface Category {
  id?: string;
  name: string;
  icon?: string;
  color?: string;
  type?: TransactionType;
  isDefault?: boolean;
  parentId?: string;
  coupleId?: string;
  userId?: string;
}

// Budget Types
export interface Budget {
  id?: string;
  category: string;
  categoryId: string;
  coupleId: string;
  amount: number;
  spent: number;
  remaining: number;
  period: "daily" | "weekly" | "monthly" | "yearly";
  startDate: string;
  endDate: string;
}

// Goal Types
export interface Goal {
  id?: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  coupleId: string;
  startDate: string;
  targetDate?: string;
  category?: string;
  categoryId?: string;
  isCompleted?: boolean;
  iconEmoji?: string;
  color?: "purple" | "blue" | "green" | "amber" | "red" | "pink" | string;
}

// Filter Types
export interface FilterOptions {
  year?: string;
  month?: string;
  category?: string;
  user?: string;
  startDate?: string;
  endDate?: string;
  type?: TransactionType | "all";
  tags?: string[];
  minAmount?: number;
  maxAmount?: number;
}

// Stats Types
export interface FinancialStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsRate?: number;
  expensesByCategory?: Record<string, number>;
  incomeByCategory?: Record<string, number>;
  monthlyData?: MonthlyFinancialData[];
}

export interface MonthlyFinancialData {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

// Receipt OCR Types
export interface ReceiptData {
  merchant: string;
  amount: number;
  date?: string;
  category?: string;
  items?: ReceiptItem[];
}

export interface ReceiptItem {
  name: string;
  price: number;
  quantity?: number;
}

// Authentication Types
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  isAnonymous?: boolean;
  coupleId?: string;
}

// Represents a couple entity in Firestore
export interface Couple {
  id: string; // Document ID for the couple
  members: string[]; // Array of user UIDs belonging to this couple
  // We can add shared settings here later, e.g., default currency, shared categories
  createdAt?: string; // Or Firebase ServerTimestamp
  // Add any other couple-specific shared data here
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// App Context Types
export interface AppContextState {
  categories: Category[];
  partnerProfile?: User | null;
  filters: FilterOptions;
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  loading: {
    transactions: boolean;
    categories: boolean;
    budgets: boolean;
    goals: boolean;
    partnerProfile?: boolean;
  };
  stats?: FinancialStats;
  setFilters: (filters: Partial<FilterOptions>) => void;
  addCategory: (
    catData: Omit<
      Category,
      "id" | "coupleId" | "isDefault" | "userId" | "createdAt" | "updatedAt"
    > & { isDefault?: boolean },
  ) => Promise<void>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addTransaction: (
    txBasicData: Omit<
      Transaction,
      | "id"
      | "coupleId"
      | "userId"
      | "user"
      | "isShared"
      | "createdAt"
      | "updatedAt"
    >,
    isSharedForCouple: boolean,
    transactionOwnerId: string,
  ) => Promise<void>;
  updateTransaction: (
    id: string,
    transaction: Partial<Transaction>,
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getFilteredTransactions: () => Transaction[];
  getTransactionsByCategory?: () => Record<string, number>;
  addBudget: (
    budget: Omit<
      Budget,
      "id" | "coupleId" | "spent" | "remaining" | "createdAt" | "updatedAt"
    >,
  ) => Promise<void>;
  updateBudget: (id: string, data: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  addGoal: (
    goal: Omit<
      Goal,
      | "id"
      | "coupleId"
      | "currentAmount"
      | "isCompleted"
      | "createdAt"
      | "updatedAt"
    >,
  ) => Promise<void>;
  updateGoal: (id: string, data: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
}
