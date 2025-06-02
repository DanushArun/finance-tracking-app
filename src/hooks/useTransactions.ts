import { useState, useCallback, useMemo } from "react";
import { useApp } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";
import { Transaction, FilterOptions, FinancialStats } from "../types";
import {
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateBalance,
  groupByCategory,
} from "../utils/helpers";

export function useTransactions() {
  const appContext = useApp();
  const { currentUser } = useAuth();

  if (!appContext) {
    throw new Error("useTransactions must be used within an AppProvider");
  }

  const {
    transactions = [],
    categories = [],
    filters,
    loading,
    addTransaction: addTxFromAppContext,
    updateTransaction: updateTxFromAppContext,
    deleteTransaction: deleteTxFromAppContext,
    setFilters,
    getFilteredTransactions,
    getTransactionsByCategory: getCtxTransactionsByCategory,
  } = appContext;

  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [transactionToEdit, setTransactionToEdit] =
    useState<Transaction | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filteredTransactions = useMemo(() => {
    return getFilteredTransactions();
  }, [getFilteredTransactions, transactions, filters]);

  // Calculate statistics based on filtered transactions
  const stats: FinancialStats = useMemo(
    () => ({
      totalIncome: calculateTotalIncome(filteredTransactions),
      totalExpenses: calculateTotalExpenses(filteredTransactions),
      balance: calculateBalance(filteredTransactions),
    }),
    [filteredTransactions],
  );

  // Handle transaction selection
  const selectTransaction = useCallback((transaction: Transaction | null) => {
    setSelectedTransaction(transaction);
  }, []);

  // Handle adding a new transaction
  const openTransactionForm = useCallback((transaction?: Transaction) => {
    setSelectedTransaction(transaction || null);
    setTransactionToEdit(transaction || null);
    setIsFormOpen(true);
  }, []);

  const closeTransactionForm = useCallback(() => {
    setTransactionToEdit(null);
    setIsFormOpen(false);
  }, []);

  const addTransaction = useCallback(
    async (
      data: Omit<
        Transaction,
        "id" | "coupleId" | "userId" | "user" | "isShared"
      >,
      isShared: boolean,
      ownerId?: string,
    ) => {
      if (!currentUser)
        throw new Error("User not authenticated for addTransaction");
      const transactionOwnerId = ownerId || currentUser.uid;
      await addTxFromAppContext(data, isShared, transactionOwnerId);
      closeTransactionForm();
    },
    [addTxFromAppContext, currentUser, closeTransactionForm],
  );

  const updateTransaction = useCallback(
    async (id: string, data: Partial<Transaction>) => {
      if (!currentUser)
        throw new Error("User not authenticated for updateTransaction");
      await updateTxFromAppContext(id, data);
      closeTransactionForm();
    },
    [updateTxFromAppContext, currentUser, closeTransactionForm],
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      if (!currentUser)
        throw new Error("User not authenticated for deleteTransaction");
      await deleteTxFromAppContext(id);
      if (selectedTransaction && selectedTransaction.id === id) {
        setSelectedTransaction(null);
      }
      if (transactionToEdit && transactionToEdit.id === id) {
        closeTransactionForm();
      }
    },
    [
      deleteTxFromAppContext,
      currentUser,
      selectedTransaction,
      transactionToEdit,
      closeTransactionForm,
    ],
  );

  // Handle filter changes
  const handleFilterChange = useCallback(
    (newFilters: Partial<FilterOptions>) => {
      setFilters(newFilters);
    },
    [setFilters],
  );

  // Get transactions by month for the current year
  const getTransactionsByMonth = useCallback(() => {
    const year =
      filters.year === "All Time"
        ? new Date().getFullYear()
        : parseInt(
            filters.year?.toString() || new Date().getFullYear().toString(),
          );

    const monthlyData = Array(12)
      .fill(0)
      .map(() => ({ income: 0, expenses: 0 }));

    filteredTransactions.forEach((tx: Transaction) => {
      const txDate = new Date(tx.date);
      const txYear = txDate.getFullYear();
      const txMonth = txDate.getMonth();

      if (txYear === year) {
        if (tx.type === "income") {
          monthlyData[txMonth].income += tx.amount;
        } else {
          monthlyData[txMonth].expenses += tx.amount;
        }
      }
    });

    return monthlyData;
  }, [filteredTransactions, filters.year]);

  // Get transactions by category
  const getTransactionsByCategory = useCallback(() => {
    // Use the context's implementation if available
    if (getCtxTransactionsByCategory) {
      return getCtxTransactionsByCategory();
    }

    const expensesByCategory: Record<string, number> = {};

    filteredTransactions
      .filter((tx: Transaction) => tx.type === "expense")
      .forEach((tx: Transaction) => {
        if (!expensesByCategory[tx.category]) {
          expensesByCategory[tx.category] = 0;
        }
        expensesByCategory[tx.category] += tx.amount;
      });

    return expensesByCategory;
  }, [filteredTransactions, getCtxTransactionsByCategory]);

  // Get transactions by user
  const getTransactionsByUser = useCallback(() => {
    const userTransactions: Record<
      string,
      { income: number; expenses: number }
    > = {};

    filteredTransactions.forEach((tx: Transaction) => {
      if (!userTransactions[tx.user]) {
        userTransactions[tx.user] = { income: 0, expenses: 0 };
      }

      if (tx.type === "income") {
        userTransactions[tx.user].income += tx.amount;
      } else {
        userTransactions[tx.user].expenses += tx.amount;
      }
    });

    return userTransactions;
  }, [filteredTransactions]);

  // Get transactions for the current partner
  const getCurrentPartnerTransactions = useCallback(() => {
    return filteredTransactions.filter(
      (tx: Transaction) => tx.user === currentUser?.uid,
    );
  }, [filteredTransactions, currentUser]);

  // Get statistics for the current partner
  const getCurrentPartnerStats = useCallback(() => {
    const partnerTransactions = getCurrentPartnerTransactions();
    return {
      totalIncome: calculateTotalIncome(partnerTransactions),
      totalExpenses: calculateTotalExpenses(partnerTransactions),
      balance: calculateBalance(partnerTransactions),
    };
  }, [getCurrentPartnerTransactions]);

  return {
    transactions,
    categories,
    filters,
    loading,
    stats,
    selectedTransaction,
    transactionToEdit,
    isFormOpen,
    openTransactionForm,
    closeTransactionForm,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    setFilters: handleFilterChange,
    getTransactionsByMonth,
    getTransactionsByCategory,
    getTransactionsByUser,
    getCurrentPartnerTransactions,
    getCurrentPartnerStats,
  };
}
