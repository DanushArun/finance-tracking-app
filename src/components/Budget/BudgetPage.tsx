import React, { useState, useEffect } from "react";
import { useApp } from "../../contexts/AppContext";
import { Budget, Category } from "../../types";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "../../contexts/AuthContext";

export const BudgetPage: React.FC = () => {
  const {
    categories,
    budgets: contextBudgets,
    addBudget,
    updateBudget,
    deleteBudget,
  } = useApp();
  const { currentUser } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [newBudget, setNewBudget] = useState<Partial<Budget>>({
    period: "monthly",
    amount: 0,
    spent: 0,
    remaining: 0,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      .toISOString()
      .split("T")[0],
  });
  const [rolloverEnabled, setRolloverEnabled] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    if (contextBudgets && contextBudgets.length > 0) {
      setBudgets(contextBudgets);
    } else if (currentUser?.coupleId) {
      const mockCoupleId = currentUser.coupleId;
      const mockBudgets: Budget[] = [
        {
          id: "1",
          category: "Groceries",
          categoryId:
            categories.find((c) => c.name === "Groceries")?.id || "mockCat1",
          amount: 500,
          spent: 320,
          remaining: 180,
          period: "monthly",
          startDate: new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1,
          )
            .toISOString()
            .split("T")[0],
          endDate: new Date(
            new Date().getFullYear(),
            new Date().getMonth() + 1,
            0,
          )
            .toISOString()
            .split("T")[0],
          coupleId: mockCoupleId,
        },
        {
          id: "2",
          category: "Dining Out",
          categoryId:
            categories.find((c) => c.name === "Dining Out")?.id || "mockCat2",
          amount: 200,
          spent: 175,
          remaining: 25,
          period: "monthly",
          startDate: new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1,
          )
            .toISOString()
            .split("T")[0],
          endDate: new Date(
            new Date().getFullYear(),
            new Date().getMonth() + 1,
            0,
          )
            .toISOString()
            .split("T")[0],
          coupleId: mockCoupleId,
        },
      ];
      setBudgets(mockBudgets);
    }
  }, [contextBudgets, currentUser, categories]);

  const handleAddBudget = async () => {
    if (!newBudget.category || !newBudget.amount) return;

    const categoryObj = categories.find((c) => c.id === newBudget.categoryId);

    const budget: Budget = {
      id: uuidv4(),
      category: categoryObj?.name || newBudget.category!,
      categoryId: newBudget.categoryId!,
      amount: Number(newBudget.amount),
      spent: 0,
      remaining: Number(newBudget.amount),
      period: newBudget.period || "monthly",
      startDate: newBudget.startDate!,
      endDate: newBudget.endDate!,
      coupleId: currentUser?.coupleId || "",
    };

    await addBudget(budget);
    setRolloverEnabled({ ...rolloverEnabled, [budget.id!]: false });
    setNewBudget({
      period: "monthly",
      amount: 0,
      spent: 0,
      remaining: 0,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
        .toISOString()
        .split("T")[0],
    });
    setShowAddModal(false);
  };

  const handleUpdateBudget = async () => {
    if (!editingBudget || !editingBudget.id) return;

    const payloadForUpdate: Partial<Budget> = {
      category: editingBudget.category,
      categoryId: editingBudget.categoryId,
      amount: Number(editingBudget.amount),
      spent: Number(editingBudget.spent),
      remaining: Number(editingBudget.amount) - Number(editingBudget.spent),
      period: editingBudget.period,
      startDate: editingBudget.startDate,
      endDate: editingBudget.endDate,
    };

    await updateBudget(editingBudget.id, payloadForUpdate);

    setBudgets(
      budgets.map((b) =>
        b.id === editingBudget!.id ? { ...b, ...payloadForUpdate } : b,
      ),
    );
    setNewBudget({
      period: "monthly",
      amount: 0,
      spent: 0,
      remaining: 0,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
        .toISOString()
        .split("T")[0],
    });
    setEditingBudget(null);
  };

  const handleDeleteBudget = (id: string) => {
    deleteBudget(id);
  };

  const toggleRollover = (id: string) => {
    setRolloverEnabled({
      ...rolloverEnabled,
      [id]: !rolloverEnabled[id],
    });
  };

  // Calculate progress percentage
  const calculateProgress = (spent: number, total: number) => {
    if (total === 0) return 0;
    const percentage = (spent / total) * 100;
    return Math.min(percentage, 100);
  };

  // Determine progress bar color based on spent percentage
  const getProgressColor = (spent: number, total: number) => {
    const percentage = calculateProgress(spent, total);
    if (percentage < 50) return "bg-green-500";
    if (percentage < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Get current date range for display
  const getCurrentPeriodDisplay = (budget: Budget) => {
    const startDate = new Date(budget.startDate);
    const endDate = new Date(budget.endDate);

    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Budget Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          New Budget
        </button>
      </div>

      {/* Budget overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Total Budgeted</h3>
            <span className="text-purple-400">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white">
            {formatCurrency(budgets.reduce((sum, b) => sum + b.amount, 0))}
          </h2>
          <p className="text-gray-500 text-sm mt-1">Current month</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Total Spent</h3>
            <span className="text-red-400">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
                />
              </svg>
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white">
            {formatCurrency(budgets.reduce((sum, b) => sum + b.spent, 0))}
          </h2>
          <p className="text-gray-500 text-sm mt-1">Current month</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Remaining</h3>
            <span className="text-green-400">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white">
            {formatCurrency(budgets.reduce((sum, b) => sum + b.remaining, 0))}
          </h2>
          <p className="text-gray-500 text-sm mt-1">Current month</p>
        </div>
      </div>

      {/* Budgets list */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold">Current Budgets</h2>
        </div>

        <div className="divide-y divide-gray-800">
          {budgets.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No budgets created yet. Click "New Budget" to get started.</p>
            </div>
          ) : (
            budgets.map((budget) => (
              <div key={budget.id} className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium">{budget.category}</h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-400">
                        {budget.period}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {getCurrentPeriodDisplay(budget)}
                    </p>
                  </div>

                  <div className="mt-3 md:mt-0 flex items-center gap-4">
                    {/* Rollover toggle */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">Rollover</span>
                      <button
                        onClick={() => toggleRollover(budget.id!)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          rolloverEnabled[budget.id!]
                            ? "bg-purple-600"
                            : "bg-gray-700"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            rolloverEnabled[budget.id!]
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    <button
                      onClick={() => setEditingBudget(budget)}
                      className="text-gray-400 hover:text-white transition"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>

                    <button
                      onClick={() => handleDeleteBudget(budget.id!)}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex justify-between mb-2">
                  <div className="flex gap-4">
                    <div>
                      <span className="text-xs text-gray-500">Budget</span>
                      <p className="font-semibold">
                        {formatCurrency(budget.amount)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Spent</span>
                      <p className="font-semibold">
                        {formatCurrency(budget.spent)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Remaining</span>
                      <p className="font-semibold">
                        {formatCurrency(budget.remaining)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-gray-500">% Used</span>
                    <p className="font-semibold">
                      {calculateProgress(budget.spent, budget.amount).toFixed(
                        0,
                      )}
                      %
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-700 rounded-full h-2.5 mt-1">
                  <div
                    className={`${getProgressColor(budget.spent, budget.amount)} h-2.5 rounded-full`}
                    style={{
                      width: `${calculateProgress(budget.spent, budget.amount)}%`,
                    }}
                  ></div>
                </div>

                {rolloverEnabled[budget.id!] && (
                  <div className="mt-3 p-2 bg-purple-900/20 border border-purple-800/30 rounded text-sm">
                    <span className="text-purple-400 font-medium">
                      Rollover enabled:
                    </span>{" "}
                    Unused budget will carry over to next period.
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Budget Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h2 className="text-xl font-bold mb-4">Create New Budget</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Category
                </label>
                <select
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={newBudget.categoryId || ""}
                  onChange={(e) => {
                    const categoryId = e.target.value;
                    const categoryName =
                      categories.find((c) => c.id === categoryId)?.name || "";
                    setNewBudget({
                      ...newBudget,
                      categoryId,
                      category: categoryName,
                    });
                  }}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Budget Amount
                </label>
                <input
                  type="number"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0.00"
                  value={newBudget.amount || ""}
                  onChange={(e) =>
                    setNewBudget({
                      ...newBudget,
                      amount: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Period
                </label>
                <select
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={newBudget.period}
                  onChange={(e) =>
                    setNewBudget({
                      ...newBudget,
                      period: e.target.value as
                        | "daily"
                        | "weekly"
                        | "monthly"
                        | "yearly",
                    })
                  }
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={newBudget.startDate}
                    onChange={(e) =>
                      setNewBudget({ ...newBudget, startDate: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={newBudget.endDate}
                    onChange={(e) =>
                      setNewBudget({ ...newBudget, endDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <button
                onClick={handleAddBudget}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
              >
                Create Budget
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Budget Modal */}
      {editingBudget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-md p-6 relative">
            <button
              onClick={() => setEditingBudget(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h2 className="text-xl font-bold mb-4">Edit Budget</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Category
                </label>
                <select
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={editingBudget.categoryId || ""}
                  onChange={(e) => {
                    const categoryId = e.target.value;
                    const categoryName =
                      categories.find((c) => c.id === categoryId)?.name || "";
                    setEditingBudget({
                      ...editingBudget,
                      categoryId,
                      category: categoryName,
                    });
                  }}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Budget Amount
                </label>
                <input
                  type="number"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0.00"
                  value={editingBudget.amount}
                  onChange={(e) =>
                    setEditingBudget({
                      ...editingBudget,
                      amount: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Period
                </label>
                <select
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={editingBudget.period}
                  onChange={(e) =>
                    setEditingBudget({
                      ...editingBudget,
                      period: e.target.value as
                        | "daily"
                        | "weekly"
                        | "monthly"
                        | "yearly",
                    })
                  }
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={editingBudget.startDate}
                    onChange={(e) =>
                      setEditingBudget({
                        ...editingBudget,
                        startDate: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={editingBudget.endDate}
                    onChange={(e) =>
                      setEditingBudget({
                        ...editingBudget,
                        endDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Current Spent Amount
                </label>
                <input
                  type="number"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0.00"
                  value={editingBudget.spent}
                  onChange={(e) => {
                    const spent = Number(e.target.value);
                    setEditingBudget({
                      ...editingBudget,
                      spent,
                      remaining: editingBudget.amount - spent,
                    });
                  }}
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="rolloverToggle"
                  checked={rolloverEnabled[editingBudget.id!] || false}
                  onChange={() => toggleRollover(editingBudget.id!)}
                  className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-600"
                />
                <label
                  htmlFor="rolloverToggle"
                  className="text-sm text-gray-300"
                >
                  Enable budget rollover to next period
                </label>
              </div>

              <button
                onClick={handleUpdateBudget}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
              >
                Update Budget
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
