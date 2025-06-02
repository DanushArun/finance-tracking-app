import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  User,
  Transaction,
  Category,
  FilterOptions,
  AppContextState,
  Budget,
  Goal,
  FinancialStats,
} from "../types";
import {
  transactionService,
  categoryService,
  budgetService,
  goalService,
} from "../services/firebaseService";
import { useAuth } from "./AuthContext";

const AppContext = createContext<AppContextState | undefined>(undefined);

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const { currentUser, isAuthenticated } = useAuth();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [partnerProfile, setPartnerProfile] = useState<User | null>(null);
  const [stats, setStats] = useState<FinancialStats | undefined>(undefined);

  const [filters, setFilters] = useState<FilterOptions>({
    year: "All Time",
    month: "All",
  });
  
  const [loading, setLoading] = useState<AppContextState["loading"]>({
    transactions: false,
    categories: false,
    budgets: false,
    goals: false,
    partnerProfile: false,
  });

  // Initialize default categories when user first signs up
  const initializeDefaultCategories = async (userId: string) => {
    const defaultCategories: Omit<Category, "id">[] = [
      // Expense categories
      { name: "Groceries", type: "expense", isDefault: true },
      { name: "Rent/Mortgage", type: "expense", isDefault: true },
      { name: "Utilities", type: "expense", isDefault: true },
      { name: "Transportation", type: "expense", isDefault: true },
      { name: "Dining Out", type: "expense", isDefault: true },
      { name: "Entertainment", type: "expense", isDefault: true },
      { name: "Healthcare", type: "expense", isDefault: true },
      { name: "Shopping", type: "expense", isDefault: true },
      { name: "Other Expense", type: "expense", isDefault: true },
      
      // Income categories
      { name: "Salary", type: "income", isDefault: true },
      { name: "Freelance", type: "income", isDefault: true },
      { name: "Investment", type: "income", isDefault: true },
      { name: "Other Income", type: "income", isDefault: true },
    ];

    try {
      const coupleId = currentUser?.coupleId || `personal_${userId}`;
      for (const category of defaultCategories) {
        await categoryService.add({
          ...category,
          userId,
          coupleId,
        });
      }
      console.log("Default categories initialized");
    } catch (error) {
      console.error("Error initializing default categories:", error);
    }
  };

  // Load all data when user changes or authenticates
  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      // Clear data when user logs out
      setTransactions([]);
      setCategories([]);
      setBudgets([]);
      setGoals([]);
      setPartnerProfile(null);
      setStats(undefined);
      return;
    }

    loadAllData();
  }, [currentUser, isAuthenticated]);

  // Load all user data
  const loadAllData = async () => {
    if (!currentUser) return;

    try {
      await Promise.all([
        loadCategories(),
        loadTransactions(),
        loadBudgets(),
        loadGoals(),
      ]);
    } catch (error) {
      console.error("Error loading app data:", error);
    }
  };

  // Load categories
  const loadCategories = async () => {
    if (!currentUser) return;

    setLoading(prev => ({ ...prev, categories: true }));
    try {
      let userCategories: Category[] = [];
      
      if (currentUser.coupleId) {
        // Load couple categories
        userCategories = await categoryService.getAllByCouple(currentUser.coupleId) as Category[];
      } else {
        // For users without couples, create a temporary coupleId based on their userId
        const tempCoupleId = `personal_${currentUser.uid}`;
        userCategories = await categoryService.getAllByCouple(tempCoupleId) as Category[];
      }

      // If no categories exist, initialize default ones
      if (userCategories.length === 0) {
        await initializeDefaultCategories(currentUser.uid);
        // Reload after initialization
        if (currentUser.coupleId) {
          userCategories = await categoryService.getAllByCouple(currentUser.coupleId) as Category[];
        } else {
          const tempCoupleId = `personal_${currentUser.uid}`;
          userCategories = await categoryService.getAllByCouple(tempCoupleId) as Category[];
        }
      }

      setCategories(userCategories);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  // Load transactions
  const loadTransactions = async () => {
    if (!currentUser) return;

    setLoading(prev => ({ ...prev, transactions: true }));
    try {
      let userTransactions: Transaction[] = [];
      
      if (currentUser.coupleId) {
        // Load couple transactions
        userTransactions = await transactionService.getAllByCouple(currentUser.coupleId) as Transaction[];
      } else {
        // For users without couples, use personal coupleId
        const tempCoupleId = `personal_${currentUser.uid}`;
        userTransactions = await transactionService.getAllByCouple(tempCoupleId) as Transaction[];
      }

      setTransactions(userTransactions);
      calculateStats(userTransactions);
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setLoading(prev => ({ ...prev, transactions: false }));
    }
  };

  // Load budgets
  const loadBudgets = async () => {
    if (!currentUser) return;

    setLoading(prev => ({ ...prev, budgets: true }));
    try {
      let userBudgets: Budget[] = [];
      
      if (currentUser.coupleId) {
        userBudgets = await budgetService.getAllByCouple(currentUser.coupleId) as Budget[];
      }

      setBudgets(userBudgets);
    } catch (error) {
      console.error("Error loading budgets:", error);
    } finally {
      setLoading(prev => ({ ...prev, budgets: false }));
    }
  };

  // Load goals
  const loadGoals = async () => {
    if (!currentUser) return;

    setLoading(prev => ({ ...prev, goals: true }));
    try {
      let userGoals: Goal[] = [];
      
      if (currentUser.coupleId) {
        userGoals = await goalService.getAllByCouple(currentUser.coupleId) as Goal[];
      }

      setGoals(userGoals);
    } catch (error) {
      console.error("Error loading goals:", error);
    } finally {
      setLoading(prev => ({ ...prev, goals: false }));
    }
  };

  // Calculate financial stats
  const calculateStats = (transactionList: Transaction[]) => {
    const totalIncome = transactionList
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactionList
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    // Calculate expenses by category
    const expensesByCategory: Record<string, number> = {};
    transactionList
      .filter(t => t.type === "expense")
      .forEach(t => {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
      });

    // Calculate income by category
    const incomeByCategory: Record<string, number> = {};
    transactionList
      .filter(t => t.type === "income")
      .forEach(t => {
        incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
      });

    setStats({
      totalIncome,
      totalExpenses,
      balance,
      savingsRate,
      expensesByCategory,
      incomeByCategory,
    });
  };

  // Add transaction
  async function addTransaction(
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
  ) {
    if (!currentUser) throw new Error("No user logged in");

    try {
      const coupleId = currentUser.coupleId || `personal_${currentUser.uid}`;
      const transactionData = {
        ...txBasicData,
        userId: transactionOwnerId,
        user: currentUser.displayName || currentUser.email,
        isShared: isSharedForCouple,
        coupleId,
      };

      const newTransactionId = await transactionService.add(transactionData);
      
      // Reload transactions to get the updated list
      await loadTransactions();
    } catch (error) {
      console.error("Error adding transaction:", error);
      throw error;
    }
  }

  // Update transaction
  async function updateTransaction(id: string, txUpdate: Partial<Transaction>) {
    try {
      await transactionService.update(id, txUpdate);
      await loadTransactions();
    } catch (error) {
      console.error("Error updating transaction:", error);
      throw error;
    }
  }

  // Delete transaction
  async function deleteTransaction(id: string) {
    try {
      await transactionService.delete(id);
      await loadTransactions();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      throw error;
    }
  }

  // Add category
  async function addCategory(
    catData: Omit<
      Category,
      "id" | "coupleId" | "isDefault" | "userId" | "createdAt" | "updatedAt"
    > & { isDefault?: boolean },
  ) {
    if (!currentUser) throw new Error("No user logged in");

    try {
      const coupleId = currentUser.coupleId || `personal_${currentUser.uid}`;
      const categoryData = {
        ...catData,
        userId: currentUser.uid,
        coupleId,
        isDefault: catData.isDefault || false,
      };

      await categoryService.add(categoryData);
      await loadCategories();
    } catch (error) {
      console.error("Error adding category:", error);
      throw error;
    }
  }

  // Update category
  async function updateCategory(id: string, catUpdate: Partial<Category>) {
    try {
      await categoryService.update(id, catUpdate);
      await loadCategories();
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  }

  // Delete category
  async function deleteCategory(id: string) {
    try {
      await categoryService.delete(id);
      await loadCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  }

  // Add budget
  async function addBudget(
    budgetData: Omit<
      Budget,
      "id" | "coupleId" | "spent" | "remaining" | "createdAt" | "updatedAt"
    >,
  ) {
    if (!currentUser) throw new Error("No user logged in");

    try {
      const budget = {
        ...budgetData,
        coupleId: currentUser.coupleId || "",
        spent: 0,
        remaining: budgetData.amount,
      };

      await budgetService.add(budget);
      await loadBudgets();
    } catch (error) {
      console.error("Error adding budget:", error);
      throw error;
    }
  }

  // Update budget
  async function updateBudget(id: string, budgetUpdate: Partial<Budget>) {
    try {
      await budgetService.update(id, budgetUpdate);
      await loadBudgets();
    } catch (error) {
      console.error("Error updating budget:", error);
      throw error;
    }
  }

  // Delete budget
  async function deleteBudget(id: string) {
    try {
      await budgetService.delete(id);
      await loadBudgets();
    } catch (error) {
      console.error("Error deleting budget:", error);
      throw error;
    }
  }

  // Add goal
  async function addGoal(
    goalData: Omit<
      Goal,
      | "id"
      | "coupleId"
      | "currentAmount"
      | "isCompleted"
      | "createdAt"
      | "updatedAt"
    >,
  ) {
    if (!currentUser) throw new Error("No user logged in");

    try {
      const goal = {
        ...goalData,
        coupleId: currentUser.coupleId || "",
        currentAmount: 0,
        isCompleted: false,
      };

      await goalService.add(goal);
      await loadGoals();
    } catch (error) {
      console.error("Error adding goal:", error);
      throw error;
    }
  }

  // Update goal
  async function updateGoal(id: string, goalUpdate: Partial<Goal>) {
    try {
      await goalService.update(id, goalUpdate);
      await loadGoals();
    } catch (error) {
      console.error("Error updating goal:", error);
      throw error;
    }
  }

  // Delete goal
  async function deleteGoal(id: string) {
    try {
      await goalService.delete(id);
      await loadGoals();
    } catch (error) {
      console.error("Error deleting goal:", error);
      throw error;
    }
  }

  // Update filters
  function updateFilters(newFilters: Partial<FilterOptions>) {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }

  // Get filtered transactions
  function getFilteredTransactions(): Transaction[] {
    let filtered = [...transactions];
    
    if (filters.category && filters.category !== "All") {
      filtered = filtered.filter(t => t.category === filters.category);
    }
    
    if (filters.type && filters.type !== "all") {
      filtered = filtered.filter(t => t.type === filters.type);
    }
    
    if (filters.user && filters.user !== "All") {
      filtered = filtered.filter(t => t.userId === filters.user);
    }
    
    // Date filtering
    if (filters.startDate) {
      filtered = filtered.filter(t => new Date(t.date) >= new Date(filters.startDate!));
    }
    
    if (filters.endDate) {
      filtered = filtered.filter(t => new Date(t.date) <= new Date(filters.endDate!));
    }
    
    // Amount filtering
    if (filters.minAmount !== undefined) {
      filtered = filtered.filter(t => t.amount >= filters.minAmount!);
    }
    
    if (filters.maxAmount !== undefined) {
      filtered = filtered.filter(t => t.amount <= filters.maxAmount!);
    }
    
    return filtered;
  }

  const value: AppContextState = {
    transactions,
    categories,
    budgets,
    goals,
    partnerProfile,
    filters,
    loading,
    stats,
    setFilters: updateFilters,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    getFilteredTransactions,
    addBudget,
    updateBudget,
    deleteBudget,
    addGoal,
    updateGoal,
    deleteGoal,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
