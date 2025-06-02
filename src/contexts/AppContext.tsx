import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  transactionService,
  categoryService,
  budgetService,
  goalService,
  userService,
} from "../services/firebaseService";
import { coupleService } from "../services/coupleService";
import { useAuth } from "./AuthContext";
import {
  User,
  Transaction,
  Category,
  FilterOptions,
  AppContextState,
  Budget,
  Goal,
  TransactionType,
} from "../types";

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
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [partnerProfile, setPartnerProfile] = useState<User | null>(null);

  const [filters, setFilters] = useState<FilterOptions>({
    year: "All Time",
    month: "All",
  });
  const [loading, setLoading] = useState<AppContextState["loading"]>({
    transactions: true,
    categories: true,
    budgets: true,
    goals: true,
    partnerProfile: true,
  });

  useEffect(() => {
    async function loadCoupleDataAndPartner() {
      if (!currentUser) {
        setTransactions([]);
        setCategories([]);
        setBudgets([]);
        setGoals([]);
        setPartnerProfile(null);
        setLoading({
          transactions: false,
          categories: false,
          budgets: false,
          goals: false,
          partnerProfile: false,
        });
        return;
      }

      setLoading((prev) => ({
        ...prev,
        transactions: true,
        categories: true,
        budgets: true,
        goals: true,
        partnerProfile: true,
      }));

      const currentCoupleId = currentUser.coupleId;
      let fetchedPartnerProfile: User | null = null;

      if (currentCoupleId) {
        try {
          const coupleData = await coupleService.getCoupleById(currentCoupleId);
          if (coupleData && coupleData.members) {
            const partnerUid = coupleData.members.find(
              (memberId: string) => memberId !== currentUser.uid,
            );
            if (partnerUid) {
              const userProfile = await userService.get(partnerUid);
              fetchedPartnerProfile = userProfile;
            }
          }
        } catch (error) {
          console.error("Error fetching couple or partner details:", error);
        }
      }
      setPartnerProfile(fetchedPartnerProfile);

      if (currentCoupleId) {
        try {
          const [transactionsData, categoriesData, budgetsData, goalsData] =
            await Promise.all([
              transactionService.getAllByCouple(currentCoupleId),
              categoryService.getAllByCouple(currentCoupleId),
              budgetService.getAllByCouple(currentCoupleId),
              goalService.getAllByCouple(currentCoupleId),
            ]);
          setTransactions(transactionsData as Transaction[]);
          setCategories(categoriesData as Category[]);
          setBudgets(budgetsData as Budget[]);
          setGoals(goalsData as Goal[]);

          if ((categoriesData as Category[]).length === 0 && currentCoupleId) {
            const defaultCategoryPayloads: Omit<Category, "id">[] = [
              {
                name: "Groceries",
                type: "expense",
                coupleId: currentCoupleId,
                isDefault: true,
              },
              {
                name: "Rent/Mortgage",
                type: "expense",
                coupleId: currentCoupleId,
                isDefault: true,
              },
              {
                name: "Utilities",
                type: "expense",
                coupleId: currentCoupleId,
                isDefault: true,
              },
              {
                name: "Transportation",
                type: "expense",
                coupleId: currentCoupleId,
                isDefault: true,
              },
              {
                name: "Dining Out",
                type: "expense",
                coupleId: currentCoupleId,
                isDefault: true,
              },
              {
                name: "Entertainment",
                type: "expense",
                coupleId: currentCoupleId,
                isDefault: true,
              },
              {
                name: "Healthcare",
                type: "expense",
                coupleId: currentCoupleId,
                isDefault: true,
              },
              {
                name: "Shopping",
                type: "expense",
                coupleId: currentCoupleId,
                isDefault: true,
              },
              {
                name: "Salary",
                type: "income",
                coupleId: currentCoupleId,
                isDefault: true,
              },
              {
                name: "Freelance",
                type: "income",
                coupleId: currentCoupleId,
                isDefault: true,
              },
              {
                name: "Investment",
                type: "income",
                coupleId: currentCoupleId,
                isDefault: true,
              },
              {
                name: "Other Income",
                type: "income",
                coupleId: currentCoupleId,
                isDefault: true,
              },
              {
                name: "Other Expense",
                type: "expense",
                coupleId: currentCoupleId,
                isDefault: true,
              },
            ];
            await Promise.all(
              defaultCategoryPayloads.map((cat) => categoryService.add(cat)),
            );
            const updatedCategories =
              await categoryService.getAllByCouple(currentCoupleId);
            setCategories(updatedCategories as Category[]);
          }
        } catch (error) {
          console.error("Error loading financial data for couple:", error);
          setTransactions([]);
          setCategories([]);
          setBudgets([]);
          setGoals([]);
        }
      } else {
        setTransactions([]);
        setCategories([]);
        setBudgets([]);
        setGoals([]);
        console.warn(
          "AppContext: User not part of a couple. Financial data not loaded.",
        );
      }

      setLoading({
        transactions: false,
        categories: false,
        budgets: false,
        goals: false,
        partnerProfile: false,
      });
    }

    loadCoupleDataAndPartner();
  }, [currentUser]);

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
    if (!currentUser || !currentUser.coupleId) {
      throw new Error("User is not authenticated or not part of a couple.");
    }
    const { coupleId, displayName: loggedInUserDisplayName } = currentUser;

    const newTransaction: Omit<Transaction, "id"> = {
      ...txBasicData,
      coupleId,
      userId: transactionOwnerId,
      user: loggedInUserDisplayName || "User",
      isShared: isSharedForCouple,
    };

    await transactionService.add(newTransaction);
    const updatedTransactions =
      await transactionService.getAllByCouple(coupleId);
    setTransactions(updatedTransactions as Transaction[]);
  }

  async function updateTransaction(id: string, txUpdate: Partial<Transaction>) {
    if (!currentUser || !currentUser.coupleId)
      throw new Error("Missing user/couple context");
    const { coupleId } = currentUser;

    const updatePayload = { ...txUpdate };

    delete updatePayload.id;
    delete updatePayload.coupleId;
    delete updatePayload.userId;

    if (Object.keys(updatePayload).length === 0) {
      console.warn("Update transaction called with no updatable fields.");
      return;
    }

    await transactionService.update(id, updatePayload);
    const updated = await transactionService.getAllByCouple(coupleId);
    setTransactions(updated as Transaction[]);
  }

  async function deleteTransaction(id: string) {
    if (!currentUser || !currentUser.coupleId)
      throw new Error("Missing user/couple context");
    await transactionService.delete(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  async function addCategory(
    catData: Omit<
      Category,
      "id" | "coupleId" | "isDefault" | "userId" | "createdAt" | "updatedAt"
    > & { isDefault?: boolean },
  ) {
    if (!currentUser || !currentUser.coupleId)
      throw new Error("Missing user/couple context");
    const { coupleId } = currentUser;
    const newCategory: Omit<Category, "id"> = {
      ...catData,
      coupleId,
      isDefault: catData.isDefault || false,
    };
    await categoryService.add(newCategory);
    const updated = await categoryService.getAllByCouple(coupleId);
    setCategories(updated as Category[]);
  }
  async function updateCategory(id: string, catUpdate: Partial<Category>) {
    if (!currentUser || !currentUser.coupleId)
      throw new Error("Missing user/couple context");
    const { coupleId } = currentUser;
    const { coupleId: _c, userId: _u, ...restOfUpdate } = catUpdate;
    await categoryService.update(id, restOfUpdate);
    const updated = await categoryService.getAllByCouple(coupleId);
    setCategories(updated as Category[]);
  }
  async function deleteCategory(id: string) {
    if (!currentUser || !currentUser.coupleId)
      throw new Error("Missing user/couple context");
    await categoryService.delete(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  async function addBudget(
    budgetData: Omit<
      Budget,
      "id" | "coupleId" | "spent" | "remaining" | "createdAt" | "updatedAt"
    >,
  ) {
    if (!currentUser || !currentUser.coupleId)
      throw new Error("Missing user/couple context");
    const { coupleId } = currentUser;
    const newBudget: Omit<Budget, "id"> = {
      ...budgetData,
      coupleId,
      spent: 0,
      remaining: budgetData.amount,
    };
    await budgetService.add(newBudget);
    const updated = await budgetService.getAllByCouple(coupleId);
    setBudgets(updated as Budget[]);
  }
  async function updateBudget(id: string, budgetUpdate: Partial<Budget>) {
    if (!currentUser || !currentUser.coupleId)
      throw new Error("Missing user/couple context");
    const { coupleId } = currentUser;
    const { coupleId: _c, ...restOfUpdate } = budgetUpdate;
    await budgetService.update(id, restOfUpdate);
    const updated = await budgetService.getAllByCouple(coupleId);
    setBudgets(updated as Budget[]);
  }
  async function deleteBudget(id: string) {
    if (!currentUser || !currentUser.coupleId)
      throw new Error("Missing user/couple context");
    await budgetService.delete(id);
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  }

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
    if (!currentUser || !currentUser.coupleId)
      throw new Error("Missing user/couple context");
    const { coupleId } = currentUser;
    const newGoal: Omit<Goal, "id"> = {
      ...goalData,
      coupleId,
      currentAmount: 0,
      isCompleted: false,
    };
    await goalService.add(newGoal);
    const updated = await goalService.getAllByCouple(coupleId);
    setGoals(updated as Goal[]);
  }
  async function updateGoal(id: string, goalUpdate: Partial<Goal>) {
    if (!currentUser || !currentUser.coupleId)
      throw new Error("Missing user/couple context");
    const { coupleId } = currentUser;
    const { coupleId: _c, ...restOfUpdate } = goalUpdate;
    await goalService.update(id, restOfUpdate);
    const updated = await goalService.getAllByCouple(coupleId);
    setGoals(updated as Goal[]);
  }
  async function deleteGoal(id: string) {
    if (!currentUser || !currentUser.coupleId)
      throw new Error("Missing user/couple context");
    await goalService.delete(id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }

  function updateFilters(newFilters: Partial<FilterOptions>) {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }
  function getFilteredTransactions(): Transaction[] {
    let filtered = [...transactions];
    if (filters.category && filters.category !== "All") {
      filtered = filtered.filter((t) => t.category === filters.category);
    }
    if (filters.type && filters.type !== "all") {
      filtered = filtered.filter((t) => t.type === filters.type);
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
    stats: undefined,
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
