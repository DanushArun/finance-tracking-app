import { useState } from "react";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { Transaction, Category } from "../../types";
import {
  formatCurrency,
  formatDate as formatDateUtil,
} from "../../utils/helpers";
import { Modal } from "../common/Modal";
import { TransactionForm } from "./TransactionForm";
import { useTransactions } from "../../hooks/useTransactions";

interface TransactionListProps {
  title?: string;
  description?: string;
  transactions: Transaction[];
  categories: Category[];
}

export const TransactionList: React.FC<TransactionListProps> = ({
  title = "Transaction History",
  description,
  transactions,
  categories,
}) => {
  const { addTransaction, updateTransaction, deleteTransaction } =
    useTransactions();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(
    null,
  );

  const handleAddEdit = async (data: Omit<Transaction, "id">) => {
    setIsLoading(true);

    try {
      if (selectedTransaction) {
        await updateTransaction(selectedTransaction.id!, data);
      } else {
        await addTransaction(data);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving transaction:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!transactionToDelete) return;

    setIsLoading(true);

    try {
      await deleteTransaction(transactionToDelete);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting transaction:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setSelectedTransaction(null);
    setIsModalOpen(true);
  };

  const openDeleteModal = (transactionId: string) => {
    setTransactionToDelete(transactionId);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setTransactionToDelete(null);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "Uncategorized";
  };

  // Group transactions by date
  const groupedTransactions: Record<string, Transaction[]> = {};

  transactions.forEach((transaction) => {
    const date = new Date(transaction.date).toDateString();
    if (!groupedTransactions[date]) {
      groupedTransactions[date] = [];
    }
    groupedTransactions[date].push(transaction);
  });

  return (
    <>
      <Card
        title={
          <div className="flex justify-between items-center w-full">
            <span>
              {title}{" "}
              <span className="text-base text-gray-400 ml-2">
                ({transactions.length} items)
              </span>
            </span>
            <Button
              size="sm"
              onClick={openAddModal}
              leftIcon={
                <svg
                  className="w-4 h-4"
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
              }
            >
              Add
            </Button>
          </div>
        }
        description={description}
        variant="glass"
        className="w-full"
      >
        <div className="space-y-6">
          {Object.keys(groupedTransactions).length === 0 ? (
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 text-center">
              <p className="text-gray-400">
                No transactions found. Add your first transaction!
              </p>
            </div>
          ) : (
            Object.entries(groupedTransactions).map(([date, transactions]) => (
              <div
                key={date}
                className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden"
              >
                <div className="px-6 py-3 border-b border-gray-800 bg-gray-800/50">
                  <h3 className="font-medium">{formatDateUtil(date)}</h3>
                </div>

                <div className="divide-y divide-gray-800">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="px-6 py-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <div
                            className={`rounded-full p-2 ${
                              transaction.type === "income"
                                ? "bg-green-500/20 text-green-500"
                                : "bg-red-500/20 text-red-500"
                            }`}
                          >
                            {transaction.type === "income" ? (
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
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                            ) : (
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
                                  d="M20 12H4"
                                />
                              </svg>
                            )}
                          </div>

                          <div>
                            <h4 className="font-medium">
                              {transaction.description}
                            </h4>
                            <div className="flex items-center mt-1 gap-2">
                              <span className="text-sm text-gray-400">
                                {getCategoryName(transaction.categoryId)}
                              </span>

                              {transaction.isRecurring && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-900/50 text-purple-300 border border-purple-800/30">
                                  <svg
                                    className="w-3 h-3 mr-1"
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
                                </span>
                              )}

                              {transaction.tags &&
                                transaction.tags.length > 0 && (
                                  <div className="flex gap-1">
                                    {transaction.tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-800 text-gray-300"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end mt-3 sm:mt-0 gap-4">
                          <span
                            className={`text-lg font-semibold ${
                              transaction.type === "income"
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {transaction.type === "income" ? "+" : "-"}{" "}
                            {formatCurrency(transaction.amount)}
                          </span>

                          <div className="flex items-center">
                            <button
                              onClick={() => openEditModal(transaction)}
                              className="p-1 text-gray-400 hover:text-white"
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
                              onClick={() => openDeleteModal(transaction.id!)}
                              className="p-1 text-gray-400 hover:text-red-400"
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
                      </div>

                      {transaction.location && (
                        <div className="mt-2 text-sm text-gray-400 flex items-center">
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
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {transaction.location}
                        </div>
                      )}

                      {/* Display receipt image if available */}
                      {transaction.receipt && (
                        <div className="mt-2">
                          <button
                            onClick={() =>
                              window.open(transaction.receipt, "_blank")
                            }
                            className="text-sm text-purple-400 flex items-center hover:text-purple-300"
                          >
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
                                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                              />
                            </svg>
                            View Receipt
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Add/Edit Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedTransaction ? "Edit Transaction" : "Add Transaction"}
      >
        <TransactionForm
          transaction={selectedTransaction || undefined}
          onSubmit={handleAddEdit}
          onCancel={closeModal}
          onClose={closeModal}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        title="Confirm Delete"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            Are you sure you want to delete this transaction? This action cannot
            be undone.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="danger"
              fullWidth
              isLoading={isLoading}
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>

            <Button variant="secondary" fullWidth onClick={closeDeleteModal}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
