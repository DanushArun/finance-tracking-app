import { useState } from "react";
import { useApp } from "../../contexts/AppContext";
import { Transaction } from "../../types";
import { TransactionList } from "../../components/Transactions/TransactionList";
import { TransactionForm } from "../../components/Transactions/TransactionForm";
import { RecurringTransactions } from "../../components/Transactions/RecurringTransactions";
import { QuickAddButtons } from "../../components/Transactions/QuickAddButtons";
import { Modal } from "../common/Modal";

export const TransactionsPage: React.FC = () => {
  const { transactions = [], categories = [], loading, addTransaction, updateTransaction } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [transactionToEdit, setTransactionToEdit] = useState<
    Transaction | undefined
  >(undefined);
  const [initialCategoryForNew, setInitialCategoryForNew] = useState<
    string | undefined
  >(undefined);

  const filteredTransactions = transactions.filter((transaction) => {
    const typeMatch = filterType === "all" || transaction.type === filterType;
    const searchMatch =
      searchTerm === "" ||
      transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      categories.find(c => c.id === transaction.categoryId)?.name
        .toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.tags &&
        transaction.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase()),
        ));
    return typeMatch && searchMatch;
  });

  const handleSubmitTransaction = async (data: Omit<Transaction, "id" | "coupleId" | "userId" | "user" | "isShared" | "createdAt" | "updatedAt">) => {
    try {
      if (transactionToEdit) {
        await updateTransaction(transactionToEdit.id!, data);
      } else {
        await addTransaction(data, true, "danush");
      }
      setShowAddModal(false);
      setTransactionToEdit(undefined);
      setInitialCategoryForNew(undefined);
    } catch (error) {
      console.error("Error saving transaction:", error);
    }
  };

  const handleCancelTransaction = () => {
    setShowAddModal(false);
    setTransactionToEdit(undefined);
    setInitialCategoryForNew(undefined);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-white">Transactions</h1>

        <div className="flex gap-3">
          <button
            onClick={() => setShowRecurringModal(true)}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Recurring
          </button>

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
                strokeWidth={1.5}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            New Transaction
          </button>
        </div>
      </div>

      {/* Quick add buttons */}
      <QuickAddButtons
        onAddTransaction={(categoryName) => {
          setTransactionToEdit(undefined); // Ensure not in edit mode
          if (categoryName) {
            setInitialCategoryForNew(categoryName);
          }
          setShowAddModal(true);
        }}
      />

      {/* Filter Controls */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex border border-gray-800 rounded-lg overflow-hidden">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              filterType === "all"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400"
            }`}
            onClick={() => setFilterType("all")}
          >
            All
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              filterType === "income"
                ? "bg-green-600 text-white"
                : "bg-gray-800 text-gray-400"
            }`}
            onClick={() => setFilterType("income")}
          >
            Income
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              filterType === "expense"
                ? "bg-red-600 text-white"
                : "bg-gray-800 text-gray-400"
            }`}
            onClick={() => setFilterType("expense")}
          >
            Expenses
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 pl-10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Transaction List */}
      {loading?.transactions ? (
        <div className="w-full py-20 flex items-center justify-center">
          <div className="animate-spin h-10 w-10 border-4 border-purple-500 border-opacity-50 rounded-full border-t-transparent"></div>
        </div>
      ) : (
        <TransactionList
          transactions={filteredTransactions}
          categories={categories}
        />
      )}

      {/* Add Transaction Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={handleCancelTransaction}
        title={transactionToEdit ? "Edit Transaction" : "Add Transaction"}
      >
        <TransactionForm
          transaction={transactionToEdit}
          initialCategoryName={initialCategoryForNew}
          onSubmit={handleSubmitTransaction}
          onCancel={handleCancelTransaction}
          onClose={handleCancelTransaction}
        />
      </Modal>

      {/* Recurring Transactions Modal */}
      {showRecurringModal && (
        <RecurringTransactions
          onClose={() => setShowRecurringModal(false)}
          onEditTransaction={(transactionData) => {
            setTransactionToEdit(transactionData);
            setShowRecurringModal(false);
            setShowAddModal(true);
          }}
        />
      )}
    </div>
  );
};
