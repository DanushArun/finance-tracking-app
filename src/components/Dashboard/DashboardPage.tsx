import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend as RechartsLegend,
} from "recharts";
import { SummaryStats } from "./SummaryStats";
import { ExpenseBreakdown } from "./ExpenseBreakdown";
import { TransactionList } from "../Transactions/TransactionList";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { Select } from "../common/Select";
import { ReceiptScannerModal } from "../ReceiptScanner/ReceiptScannerModal";
import { TransactionForm } from "../Transactions/TransactionForm";
import { useApp } from "../../contexts/AppContext";
import {
  getMonthNames,
  formatCurrency as formatCurrencyUtil,
  getChartColors,
} from "../../utils/helpers";
import { Transaction, Category, TransactionType } from "../../types";
import {
  FaUsers,
  FaChartPie,
  FaDollarSign,
  FaExchangeAlt,
  FaPlus,
  FaBolt,
  FaFilter,
  FaFileCsv,
  FaTags,
} from "react-icons/fa";
import { IconType } from "react-icons";
import { useAuth } from "../../contexts/AuthContext";

interface MonthlySpendingByCategory {
  name: string;
  total: number;
}

interface SpendingTrendData {
  date: string;
  amount: number;
}

interface PartnerSpendingSummary {
  partnerName: string;
  totalSpent: number;
  categories: Record<string, number>;
}

// Helper function to render icons, addressing TS2786
const renderIcon = (
  IconCandidate: IconType | undefined,
  className?: string,
): React.ReactElement | null => {
  if (!IconCandidate) {
    return null;
  }
  // Use type assertion to convince TypeScript this is a valid component
  const IconComponent = IconCandidate as React.ComponentType<{
    className?: string;
  }>;
  return <IconComponent className={className} />;
};

export const DashboardPage: React.FC = () => {
  const {
    filters,
    setFilters,
    transactions,
    categories,
    addTransaction,
    partnerProfile, // Use partnerProfile
    loading,
  } = useApp();
  const { currentUser } = useAuth(); // Use currentUser
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [quickAddCategory, setQuickAddCategory] = useState("");
  const [activeUserForTransaction, setActiveUserForTransaction] = useState<
    string | null
  >(null); // To track who the tx is for: currentUser.uid, partnerProfile.uid, or 'couple'

  // Filtered transactions based on global filters (year, month)
  const filteredTransactions = useMemo(() => {
    let items = [...transactions];
    // Apply filters (year, month, category, type) as before
    if (filters.year && filters.year !== "All Time") {
      items = items.filter(
        (t) => new Date(t.date).getFullYear().toString() === filters.year,
      );
    }
    if (filters.month && filters.month !== "All") {
      items = items.filter(
        (t) => (new Date(t.date).getMonth() + 1).toString() === filters.month,
      );
    }
    if (filters.category && filters.category !== "All") {
      items = items.filter((t) => t.category === filters.category);
    }
    if (filters.type && filters.type !== "all") {
      items = items.filter((t) => t.type === filters.type);
    }
    return items;
  }, [transactions, filters]);

  // --- Data Processing for Charts ---

  const monthlySpendingByCategory: MonthlySpendingByCategory[] = useMemo(() => {
    const spending: { [key: string]: number } = {};
    filteredTransactions
      .filter(
        (tx) => tx.type === "expense" && tx.user === currentUser?.displayName,
      )
      .forEach((tx) => {
        const categoryName =
          categories?.find((c) => c.id === tx.categoryId)?.name ||
          tx.category ||
          "Uncategorized";
        spending[categoryName] = (spending[categoryName] || 0) + tx.amount;
      });
    return Object.entries(spending)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5); // Top 5 categories
  }, [filteredTransactions, categories, currentUser]);

  const totalMonthlySpending = useMemo(() => {
    return filteredTransactions
      .filter(
        (tx) => tx.type === "expense" && tx.user === currentUser?.displayName,
      )
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [filteredTransactions, currentUser]);

  const savingsRateData = useMemo(() => {
    // Filter transactions for current user only
    const userTransactions = filteredTransactions.filter(
      (tx) => tx.userId === currentUser?.uid,
    );

    const income = userTransactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const expenses = userTransactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const savings = income - expenses;
    const rate = income > 0 ? (savings / income) * 100 : 0;
    return { income, expenses, savings, rate };
  }, [filteredTransactions, currentUser]);

  const spendingTrend: SpendingTrendData[] = useMemo(() => {
    // Aggregate spending by day for the last 30 days (or filtered period)
    const trend: { [date: string]: number } = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    filteredTransactions
      .filter(
        (tx) =>
          tx.type === "expense" &&
          tx.userId === currentUser?.uid &&
          new Date(tx.date) >= thirtyDaysAgo,
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach((tx) => {
        const dateStr = new Date(tx.date).toLocaleDateString("en-CA"); // YYYY-MM-DD for sorting
        trend[dateStr] = (trend[dateStr] || 0) + tx.amount;
      });
    return Object.entries(trend).map(([date, amount]) => ({ date, amount }));
  }, [filteredTransactions, currentUser]);

  const partnerSpendingSummary: PartnerSpendingSummary[] = useMemo(() => {
    const usersForSummary = [];
    if (currentUser)
      usersForSummary.push({
        id: currentUser.uid,
        name: currentUser.displayName || "User",
      });
    if (partnerProfile)
      usersForSummary.push({
        id: partnerProfile.uid,
        name: partnerProfile.displayName || "Partner",
      });

    return usersForSummary.map((user) => {
      const partnerTx = filteredTransactions.filter(
        (tx) => tx.userId === user.id && !tx.isShared,
      );
      const totalSpent = partnerTx.reduce(
        (sum, tx) => (tx.type === "expense" ? sum + tx.amount : sum),
        0,
      );
      const categoriesSummary: Record<string, number> = {};
      partnerTx.forEach((tx) => {
        if (tx.type === "expense") {
          categoriesSummary[tx.category] =
            (categoriesSummary[tx.category] || 0) + tx.amount;
        }
      });
      return {
        partnerName: user.name,
        totalSpent,
        categories: categoriesSummary,
      };
    });
  }, [filteredTransactions, currentUser, partnerProfile]);

  // --- UI Handlers ---
  const currentYearForFilter = new Date().getFullYear();
  const years = [
    "All Time",
    ...Array(6)
      .fill(0)
      .map((_, i) => (currentYearForFilter - i).toString()),
  ];
  const monthNames = [
    { value: "All", label: "All Months" },
    ...getMonthNames().map((month, index) => ({
      value: index.toString(),
      label: month,
    })),
  ];

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setFilters({ year: e.target.value });
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setFilters({ month: e.target.value });
  const handleQuickAddClick = (category: string) => {
    setQuickAddCategory(category);
    setIsTransactionFormOpen(true);
  };
  const handleAddTransaction = async (
    data: Omit<Transaction, "id" | "coupleId" | "userId" | "user" | "isShared">,
  ) => {
    if (!currentUser || !currentUser.coupleId) {
      console.error(
        "Cannot add transaction: User or couple information missing.",
      );
      return;
    }
    let transactionOwnerId = currentUser.uid; // Default to current user
    let isSharedForCouple = false;

    if (activeUserForTransaction === "couple") {
      isSharedForCouple = true;
      // For shared transactions, userId could be the current user who logged it or a generic couple ID if preferred.
      // Sticking to current user's ID as the logger for now as per original model.
      transactionOwnerId = currentUser.uid;
    } else if (activeUserForTransaction === partnerProfile?.uid) {
      transactionOwnerId = partnerProfile.uid;
      isSharedForCouple = false; // Individual transaction for partner
    } else {
      // Individual transaction for currentUser, defaults are fine.
      isSharedForCouple = false;
      transactionOwnerId = currentUser.uid;
    }

    try {
      await addTransaction(data, isSharedForCouple, transactionOwnerId);
      setIsTransactionFormOpen(false);
      setQuickAddCategory("");
      setActiveUserForTransaction(null); // Reset active user
    } catch (error) {
      console.error("Error adding transaction:", error);
      // Add user-facing error message here
    }
  };

  const openTransactionFormFor = (
    userType: "currentUser" | "partner" | "couple",
    categoryName?: string,
  ) => {
    if (categoryName) setQuickAddCategory(categoryName);
    if (userType === "currentUser") {
      setActiveUserForTransaction(currentUser?.uid || null);
    } else if (userType === "partner") {
      setActiveUserForTransaction(partnerProfile?.uid || null);
    } else if (userType === "couple") {
      setActiveUserForTransaction("couple");
    }
    setIsTransactionFormOpen(true);
  };

  // --- Render ---
  const SpendingBreakdownIcon = renderIcon(FaChartPie, "text-green-400");
  const SavingsSnapshotIcon = renderIcon(FaDollarSign, "text-yellow-400");
  const SpendingTrendIcon = renderIcon(FaExchangeAlt, "text-blue-400");
  const PartnerContributionsIcon = renderIcon(FaUsers, "text-indigo-400");
  const ActionsIcon = renderIcon(FaBolt, "text-yellow-400");
  const AddTransactionIcon = renderIcon(FaPlus);
  const ExportCsvIcon = renderIcon(FaFileCsv);
  const QuickAddIcon = renderIcon(FaTags, "text-teal-400");
  const FilterDataIcon = renderIcon(FaFilter, "text-cyan-400");

  // Quick add buttons for users
  const userButtons = [];
  if (currentUser) {
    userButtons.push(
      <Button
        key="currentUser"
        onClick={() => openTransactionFormFor("currentUser")}
        variant={
          activeUserForTransaction === currentUser.uid ? "primary" : "secondary"
        }
        className="flex-1"
      >
        Add for {currentUser.displayName || "Me"}
      </Button>,
    );
  }
  if (partnerProfile) {
    userButtons.push(
      <Button
        key="partner"
        onClick={() => openTransactionFormFor("partner")}
        variant={
          activeUserForTransaction === partnerProfile.uid
            ? "primary"
            : "secondary"
        }
        className="flex-1"
      >
        Add for {partnerProfile.displayName || "Partner"}
      </Button>,
    );
  }
  userButtons.push(
    <Button
      key="couple"
      onClick={() => openTransactionFormFor("couple")}
      variant={activeUserForTransaction === "couple" ? "primary" : "secondary"}
      className="flex-1"
    >
      Add to Common
    </Button>,
  );

  // Initial transaction for form (if quick adding)
  const initialTransactionDataForForm = ():
    | Omit<Transaction, "id" | "coupleId" | "userId" | "user" | "isShared">
    | undefined => {
    if (!quickAddCategory) return undefined;
    const categoryObj = categories.find((c) => c.name === quickAddCategory);
    return {
      type: "expense",
      amount: 0,
      description: quickAddCategory, // Or a more detailed description
      category: quickAddCategory,
      categoryId: categoryObj?.id || "", // Ensure there's a fallback or handle missing categoryId
      date: new Date().toISOString().split("T")[0],
      // `user`, `userId`, `coupleId`, `isShared` will be set by handleAddTransaction based on activeUserForTransaction
      notes: "",
      tags: [],
    };
  };

  return (
    <div>
      <header className="mb-8 text-center relative z-10 pt-2">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300 py-1 font-heading">
          Personal Finance
        </h1>
        <p className="text-gray-400 mt-2 text-2xl font-heading">💲</p>
      </header>

      <div className="w-full mb-6 flex flex-wrap gap-3">{userButtons}</div>

      <p className="text-center text-lg text-white mb-6 relative z-10">
        Viewing data for:{" "}
        <span className="font-bold text-purple-400">
          {currentUser?.displayName}
        </span>
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-6">
          <Card
            title={`${currentUser?.displayName}'s Monthly Spending Breakdown`}
            titleIcon={SpendingBreakdownIcon}
            className="border border-gray-700/30"
            headerClassName="text-lg font-heading font-bold"
            variant="glass"
            glowEffect
          >
            {monthlySpendingByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={monthlySpendingByCategory}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis
                    type="number"
                    stroke="#9ca3af"
                    tickFormatter={formatCurrencyUtil}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#9ca3af"
                    width={80}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrencyUtil(value)}
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "0.5rem",
                    }}
                    labelStyle={{ color: "#e5e7eb", fontWeight: "bold" }}
                    itemStyle={{ color: "#d1d5db" }}
                  />
                  <Bar
                    dataKey="total"
                    fill={getChartColors()[0]}
                    radius={[0, 5, 5, 0]}
                    barSize={20}
                  >
                    {monthlySpendingByCategory.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getChartColors()[index % getChartColors().length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-center py-10">
                No spending data for this period.
              </p>
            )}
            <p className="text-right text-gray-300 mt-3 pr-2">
              Total Spending:{" "}
              <span className="font-semibold text-xl text-purple-400">
                {formatCurrencyUtil(totalMonthlySpending)}
              </span>
            </p>
          </Card>

          <Card
            title={`${currentUser?.displayName}'s Savings Snapshot`}
            titleIcon={SavingsSnapshotIcon}
            className="border border-gray-700/30"
            headerClassName="text-lg font-heading font-bold"
            variant="glass"
            glowEffect
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center p-4">
              <div>
                <p className="text-xs text-gray-400 uppercase font-heading">
                  Income
                </p>
                <p className="text-2xl font-semibold text-green-400">
                  {formatCurrencyUtil(savingsRateData.income)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-heading">
                  Expenses
                </p>
                <p className="text-2xl font-semibold text-red-400">
                  {formatCurrencyUtil(savingsRateData.expenses)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-heading">
                  Savings Rate
                </p>
                <p
                  className={`text-3xl font-bold ${savingsRateData.rate >= 0 ? "text-sky-400" : "text-orange-400"}`}
                >
                  {savingsRateData.rate.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-300">
                  ({formatCurrencyUtil(savingsRateData.savings)})
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card
            title={`${currentUser?.displayName}'s Spending Trend (Last 30 Days)`}
            titleIcon={SpendingTrendIcon}
            className="border border-gray-700/30 h-full"
            headerClassName="text-lg font-heading font-bold"
            variant="glass"
            glowEffect
          >
            {spendingTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={spendingTrend}
                  margin={{ top: 5, right: 20, left: 0, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis
                    dataKey="date"
                    stroke="#9ca3af"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tickFormatter={(tick) =>
                      new Date(tick).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                      })
                    }
                  />
                  <YAxis stroke="#9ca3af" tickFormatter={formatCurrencyUtil} />
                  <Tooltip
                    formatter={(value: number) => formatCurrencyUtil(value)}
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "0.5rem",
                    }}
                    labelStyle={{ color: "#e5e7eb", fontWeight: "bold" }}
                    itemStyle={{ color: "#d1d5db" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Spending"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-center py-10">
                Not enough data for trend.
              </p>
            )}
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 items-start">
        <Card
          title="Actions"
          titleIcon={ActionsIcon}
          className="border border-gray-700/30"
          headerClassName="text-lg font-heading font-bold"
          variant="glass"
          glowEffect
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-1">
            <Button
              size="lg"
              className="w-full shadow-purple-500/30 hover:shadow-lg py-3"
              leftIcon={AddTransactionIcon}
              onClick={() => setIsTransactionFormOpen(true)}
            >
              {" "}
              Add New Transaction{" "}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="w-full py-3"
              leftIcon={ExportCsvIcon}
            >
              {" "}
              Export CSV{" "}
            </Button>
          </div>
        </Card>
        <Card
          title="Quick Add Common Expenses"
          titleIcon={QuickAddIcon}
          className="border border-gray-700/30"
          headerClassName="text-lg font-heading font-bold"
          variant="glass"
          glowEffect
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-1">
            {["Coffee", "Lunch", "Bus Fare", "Snacks"].map((item) => (
              <Button
                key={item}
                variant="outline"
                className="w-full py-2.5 text-sm"
                onClick={() => handleQuickAddClick(item)}
              >
                {item}
              </Button>
            ))}
          </div>
        </Card>
      </div>

      <Card
        title="Filter Your Data"
        titleIcon={FilterDataIcon}
        className="mb-8 border border-gray-700/30"
        headerClassName="text-lg font-heading font-bold"
        variant="glass"
        glowEffect
      >
        <div className="flex flex-col sm:flex-row gap-4 p-1">
          <div className="flex-1">
            <Select
              label="Year:"
              value={filters.year?.toString() || "All Time"}
              onChange={handleYearChange}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex-1">
            <Select
              label="Month:"
              value={filters.month?.toString() || "All"}
              onChange={handleMonthChange}
              disabled={filters.year === "All Time"}
            >
              {monthNames.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      <SummaryStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 max-w-screen-xl mx-auto relative z-10">
        <Card
          title="Overview"
          variant="glass"
          glowEffect
          titleGradient
          titleIcon={
            <svg
              className="h-7 w-7 text-sky-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          }
          className="min-h-[480px]"
          headerClassName="font-heading font-bold"
        >
          <div className="flex-grow h-72 md:h-80">
            {/* Bar chart will go here */}
          </div>
        </Card>

        <ExpenseBreakdown data={monthlySpendingByCategory} />
      </div>

      <div className="mb-12 max-w-4xl mx-auto relative z-10">
        <Card
          title="Partner Contributions"
          variant="glass"
          glowEffect
          titleGradient
          titleIcon={
            <svg
              className="h-7 w-7 text-indigo-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          }
          headerClassName="font-heading font-bold"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {partnerSpendingSummary.map((partner) => (
              <div
                key={partner.partnerName}
                className="p-6 bg-gray-800/20 backdrop-blur-sm rounded-2xl border border-white/10"
              >
                <h3 className="text-xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300 font-heading font-bold">
                  {partner.partnerName}\'s Summary
                </h3>
                <div className="space-y-2 text-lg">
                  <p className="flex justify-between">
                    <span className="font-heading">Total Spent:</span>
                    <span className="font-semibold text-purple-400">
                      {formatCurrencyUtil(partner.totalSpent)}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="max-w-screen-lg mx-auto relative z-10">
        <h2 className="text-xl font-bold mb-4 font-heading text-white">
          {currentUser?.displayName}'s Transactions
        </h2>
        <TransactionList
          transactions={filteredTransactions.filter(
            (tx) => tx.userId === currentUser?.uid,
          )}
          categories={categories || []}
        />
      </div>

      <footer className="mt-12 pb-8 text-center text-xs text-gray-500 relative z-10">
        <p>
          &copy; {new Date().getFullYear()} Finance Tracking. All rights
          reserved.
        </p>
      </footer>

      {isReceiptModalOpen && (
        <ReceiptScannerModal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          onScanComplete={(data) => console.log("Receipt data:", data)}
        />
      )}

      {isTransactionFormOpen && (
        <TransactionForm
          transaction={initialTransactionDataForForm()}
          onClose={() => {
            setIsTransactionFormOpen(false);
            setQuickAddCategory("");
          }}
          onSubmit={handleAddTransaction}
          onCancel={() => {
            setIsTransactionFormOpen(false);
            setQuickAddCategory("");
          }}
        />
      )}
    </div>
  );
};
