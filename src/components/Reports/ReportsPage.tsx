import React, { useState, useEffect } from "react";
import { useApp } from "../../contexts/AppContext";
import { formatCurrency as formatCurrencyUtil } from "../../utils/helpers";

export const ReportsPage: React.FC = () => {
  const { transactions = [], categories = [] } = useApp();
  const [activeTab, setActiveTab] = useState<
    "trends" | "comparison" | "networth"
  >("trends");
  const [timeRange, setTimeRange] = useState<"1m" | "3m" | "6m" | "1y" | "all">(
    "3m",
  );

  // Mock data for charts - in a real app, this would be calculated from actual transactions
  const mockChartData = {
    incomeByMonth: [4500, 4500, 4800, 4500, 5200, 4500],
    expensesByMonth: [3200, 3800, 3400, 3700, 3300, 3500],
    expensesByCategory: [
      { name: "Housing", amount: 1200, percentage: 35 },
      { name: "Food", amount: 800, percentage: 22 },
      { name: "Transportation", amount: 400, percentage: 11 },
      { name: "Utilities", amount: 350, percentage: 10 },
      { name: "Entertainment", amount: 300, percentage: 8 },
      { name: "Healthcare", amount: 250, percentage: 7 },
      { name: "Others", amount: 250, percentage: 7 },
    ],
    savingsRate: 22, // percentage
    netWorth: {
      assets: 38000,
      liabilities: 12000,
      total: 26000,
      history: [22000, 23500, 24200, 25100, 26000],
    },
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  };

  // Get month range based on selected time range
  const getMonthRange = () => {
    switch (timeRange) {
      case "1m":
        return mockChartData.months.slice(-1);
      case "3m":
        return mockChartData.months.slice(-3);
      case "6m":
        return mockChartData.months;
      case "1y":
        return [
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
          ...mockChartData.months,
        ];
      default:
        return mockChartData.months;
    }
  };

  // Get filtered data for the selected time range
  const getFilteredData = (data: number[]) => {
    switch (timeRange) {
      case "1m":
        return data.slice(-1);
      case "3m":
        return data.slice(-3);
      case "6m":
        return data;
      case "1y":
        return [...data.map((d) => d * 0.9), ...data]; // Mock data for full year
      default:
        return data;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Financial Reports</h1>

        <div className="flex space-x-2">
          <select
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
          >
            <option value="1m">Last Month</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
            <option value="all">All Time</option>
          </select>

          <button className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2">
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Report Navigation Tabs */}
      <div className="flex border-b border-gray-800 mb-8">
        <button
          className={`px-6 py-3 text-sm font-medium border-b-2 -mb-px ${
            activeTab === "trends"
              ? "border-purple-500 text-purple-400"
              : "border-transparent text-gray-400 hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("trends")}
        >
          Spending Trends
        </button>
        <button
          className={`px-6 py-3 text-sm font-medium border-b-2 -mb-px ${
            activeTab === "comparison"
              ? "border-purple-500 text-purple-400"
              : "border-transparent text-gray-400 hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("comparison")}
        >
          Comparison Reports
        </button>
        <button
          className={`px-6 py-3 text-sm font-medium border-b-2 -mb-px ${
            activeTab === "networth"
              ? "border-purple-500 text-purple-400"
              : "border-transparent text-gray-400 hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("networth")}
        >
          Net Worth
        </button>
      </div>

      {/* Spending Trends Tab */}
      {activeTab === "trends" && (
        <div className="space-y-8">
          {/* Income vs Expenses Chart */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6">
            <h2 className="text-lg font-medium mb-6">Income vs Expenses</h2>

            <div className="h-64 relative">
              {/* This would be a real chart component in production */}
              <div className="absolute inset-0 flex items-end">
                {getMonthRange().map((month, index) => (
                  <div
                    key={index}
                    className="flex-1 mx-1 flex flex-col items-center"
                  >
                    <div className="w-full flex flex-col items-center space-y-1">
                      {/* Income Bar */}
                      <div
                        className="w-full max-w-[30px] bg-green-500 rounded-t"
                        style={{
                          height: `${getFilteredData(mockChartData.incomeByMonth)[index] / 60}px`,
                        }}
                      ></div>

                      {/* Expense Bar */}
                      <div
                        className="w-full max-w-[30px] bg-red-500 rounded-t"
                        style={{
                          height: `${getFilteredData(mockChartData.expensesByMonth)[index] / 60}px`,
                        }}
                      ></div>
                    </div>

                    <div className="text-xs text-gray-400 mt-2">{month}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center mt-4 space-x-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-300">Income</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-300">Expenses</span>
              </div>
            </div>
          </div>

          {/* Expenses by Category */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6">
            <h2 className="text-lg font-medium mb-6">Expenses by Category</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Pie Chart Visualization */}
              <div className="flex items-center justify-center">
                <div className="relative w-48 h-48">
                  {/* This is a simplified visualization of a pie chart */}
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#374151"
                      strokeWidth="20"
                    />

                    {/* These would be dynamically calculated in a real chart */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#8B5CF6"
                      strokeWidth="20"
                      strokeDasharray="251.2"
                      strokeDashoffset="0"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#EC4899"
                      strokeWidth="20"
                      strokeDasharray="251.2"
                      strokeDashoffset="188.4"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#3B82F6"
                      strokeWidth="20"
                      strokeDasharray="251.2"
                      strokeDashoffset="213.52"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#10B981"
                      strokeWidth="20"
                      strokeDasharray="251.2"
                      strokeDashoffset="238.64"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#F59E0B"
                      strokeWidth="20"
                      strokeDasharray="251.2"
                      strokeDashoffset="251.2"
                    />
                  </svg>
                </div>
              </div>

              {/* Category List */}
              <div>
                {mockChartData.expensesByCategory.map((category, index) => (
                  <div key={index} className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{
                            backgroundColor: [
                              "#8B5CF6",
                              "#EC4899",
                              "#3B82F6",
                              "#10B981",
                              "#F59E0B",
                              "#6366F1",
                              "#D97706",
                            ][index % 7],
                          }}
                        ></div>
                        <span className="text-sm text-gray-300">
                          {category.name}
                        </span>
                      </div>
                      <span className="text-sm text-gray-300 font-medium">
                        {formatCurrencyUtil(category.amount)} (
                        {category.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-700 rounded-full">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${category.percentage}%`,
                          backgroundColor: [
                            "#8B5CF6",
                            "#EC4899",
                            "#3B82F6",
                            "#10B981",
                            "#F59E0B",
                            "#6366F1",
                            "#D97706",
                          ][index % 7],
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Savings Rate */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6">
            <h2 className="text-lg font-medium mb-4">Savings Rate</h2>

            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-400">Monthly Average</div>
              <div className="font-semibold">{mockChartData.savingsRate}%</div>
            </div>

            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full bg-purple-500"
                style={{ width: `${mockChartData.savingsRate}%` }}
              ></div>
            </div>

            <div className="mt-4 flex justify-between text-xs text-gray-400">
              <div>0%</div>
              <div>25%</div>
              <div>50%</div>
              <div>75%</div>
              <div>100%</div>
            </div>

            <div className="mt-6 p-4 bg-purple-900/20 border border-purple-800/30 rounded-lg">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-purple-400 mt-0.5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-sm text-gray-300">
                    Your savings rate is above average (15%). Keep up the good
                    work!
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    A good savings rate is typically 15-20% of your income.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Tab */}
      {activeTab === "comparison" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Month-to-Month Comparison */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6">
              <h2 className="text-lg font-medium mb-4">Month-to-Month</h2>

              <div className="flex items-center justify-between mb-4">
                <div className="text-gray-400">May vs. June</div>
                <div className="text-green-400 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                  12%
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <div className="text-sm">Income</div>
                  <div className="flex space-x-2">
                    <span className="text-sm text-gray-400">
                      {formatCurrencyUtil(mockChartData.incomeByMonth[4])}
                    </span>
                    <span className="text-sm">
                      {formatCurrencyUtil(mockChartData.incomeByMonth[5])}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <div className="text-sm">Expenses</div>
                  <div className="flex space-x-2">
                    <span className="text-sm text-gray-400">
                      {formatCurrencyUtil(mockChartData.expensesByMonth[4])}
                    </span>
                    <span className="text-sm">
                      {formatCurrencyUtil(mockChartData.expensesByMonth[5])}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between border-t border-gray-700 pt-2">
                  <div className="text-sm font-medium">Savings</div>
                  <div className="flex space-x-2">
                    <span className="text-sm text-gray-400">
                      {formatCurrencyUtil(
                        mockChartData.incomeByMonth[4] -
                          mockChartData.expensesByMonth[4],
                      )}
                    </span>
                    <span className="text-sm font-medium">
                      {formatCurrencyUtil(
                        mockChartData.incomeByMonth[5] -
                          mockChartData.expensesByMonth[5],
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Year-over-Year Comparison */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6">
              <h2 className="text-lg font-medium mb-4">Year-over-Year</h2>

              <div className="flex items-center justify-between mb-4">
                <div className="text-gray-400">2023 vs. 2024 (YTD)</div>
                <div className="text-red-400 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                  5%
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <div className="text-sm">Income</div>
                  <div className="flex space-x-2">
                    <span className="text-sm text-gray-400">
                      {formatCurrencyUtil(27000)}
                    </span>
                    <span className="text-sm">{formatCurrencyUtil(25500)}</span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <div className="text-sm">Expenses</div>
                  <div className="flex space-x-2">
                    <span className="text-sm text-gray-400">
                      {formatCurrencyUtil(19800)}
                    </span>
                    <span className="text-sm">{formatCurrencyUtil(20900)}</span>
                  </div>
                </div>

                <div className="flex justify-between border-t border-gray-700 pt-2">
                  <div className="text-sm font-medium">Savings</div>
                  <div className="flex space-x-2">
                    <span className="text-sm text-gray-400">
                      {formatCurrencyUtil(7200)}
                    </span>
                    <span className="text-sm font-medium">
                      {formatCurrencyUtil(4600)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Comparison */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6">
            <h2 className="text-lg font-medium mb-6">Category Comparison</h2>

            <div className="space-y-6">
              {mockChartData.expensesByCategory
                .slice(0, 4)
                .map((category, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm">{category.name}</div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-400">
                          {formatCurrencyUtil(category.amount * 0.9)}
                        </span>
                        <span className="text-sm">
                          {formatCurrencyUtil(category.amount)}
                        </span>
                        <span
                          className={`text-xs ${
                            category.amount > category.amount * 0.9
                              ? "text-red-400"
                              : "text-green-400"
                          }`}
                        >
                          {category.amount > category.amount * 0.9 ? "+" : ""}
                          {(
                            (category.amount / (category.amount * 0.9) - 1) *
                            100
                          ).toFixed(0)}
                          %
                        </span>
                      </div>
                    </div>

                    <div className="flex h-2.5 w-full">
                      <div
                        className="bg-gray-600 h-2.5 rounded-l"
                        style={{
                          width: `${((category.amount * 0.9) / (category.amount * 1.1)) * 100}%`,
                        }}
                      ></div>
                      <div
                        className={`${
                          category.amount > category.amount * 0.9
                            ? "bg-red-500"
                            : "bg-green-500"
                        } h-2.5 rounded-r`}
                        style={{
                          width: `${Math.abs(((category.amount - category.amount * 0.9) / (category.amount * 1.1)) * 100)}%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <div>Previous</div>
                      <div>Current</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* What-If Scenario Planning */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6">
            <h2 className="text-lg font-medium mb-6">
              What-If Scenario Planning
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  If I reduce my monthly spending by:
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="500"
                    step="50"
                    defaultValue="200"
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="absolute left-0 right-0 -bottom-6 flex justify-between text-xs text-gray-500">
                    <span>$0</span>
                    <span>$100</span>
                    <span>$200</span>
                    <span>$300</span>
                    <span>$400</span>
                    <span>$500</span>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <div className="p-4 bg-purple-900/20 border border-purple-800/30 rounded-lg">
                  <h3 className="font-medium mb-2">Projected Outcome:</h3>
                  <p className="text-sm text-gray-300 mb-4">
                    Reducing your monthly spending by $200 would increase your
                    annual savings by $2,400.
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-xs text-gray-400">
                        Current Annual Savings
                      </div>
                      <div className="text-lg font-medium">
                        {formatCurrencyUtil(7200)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">
                        Projected Annual Savings
                      </div>
                      <div className="text-lg font-medium text-green-400">
                        {formatCurrencyUtil(9600)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Net Worth Tab */}
      {activeTab === "networth" && (
        <div className="space-y-8">
          {/* Net Worth Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-400 font-medium">Assets</h3>
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
                      strokeWidth={1.5}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </span>
              </div>
              <h2 className="text-2xl font-bold">
                {formatCurrencyUtil(mockChartData.netWorth.assets)}
              </h2>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-400 font-medium">Liabilities</h3>
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
                      strokeWidth={1.5}
                      d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </span>
              </div>
              <h2 className="text-2xl font-bold">
                {formatCurrencyUtil(mockChartData.netWorth.liabilities)}
              </h2>
            </div>

            <div className="bg-purple-900/30 backdrop-blur-sm rounded-xl border border-purple-800/30 p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-purple-300 font-medium">Net Worth</h3>
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
                      strokeWidth={1.5}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </span>
              </div>
              <h2 className="text-2xl font-bold">
                {formatCurrencyUtil(mockChartData.netWorth.total)}
              </h2>
            </div>
          </div>

          {/* Net Worth Trend Chart */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6">
            <h2 className="text-lg font-medium mb-6">Net Worth Trend</h2>

            <div className="h-64 relative">
              {/* This would be a real chart component in production */}
              <div className="absolute inset-0 flex items-end">
                <div className="relative w-full h-full">
                  {/* Line Chart Background Grid */}
                  <div className="absolute inset-0 grid grid-rows-4 gap-0 pointer-events-none">
                    {[0, 1, 2, 3].map((_, i) => (
                      <div
                        key={i}
                        className="border-t border-gray-800 relative"
                      >
                        <span className="absolute -top-3 -left-12 text-xs text-gray-500">
                          ${((4 - i) * 10000).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Line Chart Line */}
                  <svg
                    className="absolute inset-0 w-full h-full"
                    preserveAspectRatio="none"
                  >
                    <polyline
                      points="0,80% 25%,75% 50%,73% 75%,70% 100%,65%"
                      fill="none"
                      stroke="#8B5CF6"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Dots at each point */}
                    <circle cx="0" cy="80%" r="3" fill="#8B5CF6" />
                    <circle cx="25%" cy="75%" r="3" fill="#8B5CF6" />
                    <circle cx="50%" cy="73%" r="3" fill="#8B5CF6" />
                    <circle cx="75%" cy="70%" r="3" fill="#8B5CF6" />
                    <circle cx="100%" cy="65%" r="3" fill="#8B5CF6" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-4 text-xs text-gray-400">
              <div>Jan</div>
              <div>Feb</div>
              <div>Mar</div>
              <div>Apr</div>
              <div>May</div>
            </div>
          </div>

          {/* Asset Allocation */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6">
            <h2 className="text-lg font-medium mb-6">Asset Allocation</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Pie Chart Visualization */}
              <div className="flex items-center justify-center">
                <div className="relative w-48 h-48">
                  {/* This is a simplified visualization of a pie chart */}
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#374151"
                      strokeWidth="20"
                    />

                    {/* These would be dynamically calculated in a real chart */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#8B5CF6"
                      strokeWidth="20"
                      strokeDasharray="251.2"
                      strokeDashoffset="0"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#10B981"
                      strokeWidth="20"
                      strokeDasharray="251.2"
                      strokeDashoffset="125.6"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#3B82F6"
                      strokeWidth="20"
                      strokeDasharray="251.2"
                      strokeDashoffset="188.4"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#F59E0B"
                      strokeWidth="20"
                      strokeDasharray="251.2"
                      strokeDashoffset="226.08"
                    />
                  </svg>
                </div>
              </div>

              {/* Asset List */}
              <div>
                {[
                  { name: "Cash & Savings", amount: 15000, percentage: 39 },
                  { name: "Investments", amount: 12000, percentage: 32 },
                  { name: "Retirement", amount: 8000, percentage: 21 },
                  { name: "Other Assets", amount: 3000, percentage: 8 },
                ].map((asset, index) => (
                  <div key={index} className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{
                            backgroundColor: [
                              "#8B5CF6",
                              "#10B981",
                              "#3B82F6",
                              "#F59E0B",
                            ][index % 4],
                          }}
                        ></div>
                        <span className="text-sm">{asset.name}</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        {formatCurrencyUtil(asset.amount)} ({asset.percentage}%)
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${asset.percentage}%`,
                          backgroundColor: [
                            "#8B5CF6",
                            "#10B981",
                            "#3B82F6",
                            "#F59E0B",
                          ][index % 4],
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
