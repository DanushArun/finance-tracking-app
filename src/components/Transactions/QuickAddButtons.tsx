import { Button } from "../common/Button";

interface QuickAddButtonsProps {
  onAddTransaction: (categoryName?: string) => void;
}

export const QuickAddButtons: React.FC<QuickAddButtonsProps> = ({
  onAddTransaction,
}) => {
  const quickTransactions = [
    { name: "Groceries", icon: "🛒", color: "bg-green-600" },
    { name: "Coffee", icon: "☕", color: "bg-amber-600" },
    { name: "Transport", icon: "🚌", color: "bg-blue-600" },
    { name: "Dining", icon: "🍽️", color: "bg-red-600" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {quickTransactions.map((item) => (
        <Button
          key={item.name}
          onClick={() => onAddTransaction(item.name)}
          variant="secondary"
          className={`w-full ${item.color} hover:opacity-90`}
        >
          <span className="flex items-center gap-2">
            <span className="text-lg">{item.icon}</span>
            <span>{item.name}</span>
          </span>
        </Button>
      ))}
    </div>
  );
};
