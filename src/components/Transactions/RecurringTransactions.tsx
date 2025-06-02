import { Modal } from "../common/Modal";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { useApp } from "../../contexts/AppContext";
import { Transaction } from "../../types";
import { formatCurrency, formatDate } from "../../utils/helpers";

interface RecurringTransactionsProps {
  onClose: () => void;
  onEditTransaction: (transaction: Transaction) => void;
}

export const RecurringTransactions: React.FC<RecurringTransactionsProps> = ({
  onClose,
  onEditTransaction,
}) => {
  const { transactions, deleteTransaction } = useApp();

  const recurringTransactions =
    transactions?.filter((t) => t.isRecurring) || [];

  const handleDelete = async (transactionId: string) => {
    if (
      window.confirm(
        "Are you sure you want to stop this transaction from recurring? This will delete the template.",
      )
    ) {
      try {
        alert("Recurring transaction deleted (placeholder action).");
      } catch (error) {
        console.error("Error deleting recurring transaction:", error);
      }
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Recurring Transactions"
      maxWidth="lg"
    >
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">
          Active Recurring Transactions
        </h3>

        {recurringTransactions.length > 0 ? (
          <div className="space-y-4">
            {recurringTransactions.map((transaction) => (
              <Card key={transaction.id} variant="dark-solid" className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{transaction.description}</h4>
                    <div className="text-sm text-gray-400 mt-1">
                      {transaction.recurringInterval?.charAt(0).toUpperCase()}
                      {transaction.recurringInterval?.slice(1)}
                      {/* Next: {new Date(transaction.nextDate).toLocaleDateString()} */}
                      {/* TODO: Calculate and display actual next occurrence date */}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={
                        transaction.type === "expense"
                          ? "text-red-400"
                          : "text-green-400"
                      }
                    >
                      {transaction.type === "expense" ? "-" : "+"}{" "}
                      {formatCurrency(transaction.amount)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {transaction.category}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onEditTransaction(transaction)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(transaction.id!)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-800 rounded-lg">
            <p className="text-gray-400">No recurring transactions found</p>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button
          onClick={() =>
            onEditTransaction({
              isRecurring: true,
              recurringInterval: "monthly",
            } as Transaction)
          }
        >
          Add Recurring Transaction
        </Button>
      </div>
    </Modal>
  );
};
