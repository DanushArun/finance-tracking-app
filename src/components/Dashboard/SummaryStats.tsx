import { Card } from "../common/Card";
import { formatCurrency } from "../../utils/helpers";
import { useTransactions } from "../../hooks/useTransactions";

export const SummaryStats: React.FC = () => {
  const { stats, currentPartner, getCurrentPartnerStats } = useTransactions();

  // Use partner-specific stats if available, otherwise fall back to overall stats
  const partnerStats = getCurrentPartnerStats
    ? getCurrentPartnerStats()
    : stats;
  const { totalIncome, totalExpenses, balance } = partnerStats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
      <Card
        variant="glass"
        className="bg-opacity-10 bg-green-900/10 border border-green-500/20 backdrop-blur-sm"
      >
        <div className="text-center">
          <p className="text-xs text-green-400 uppercase tracking-wider font-semibold">
            {currentPartner}'s Income
          </p>
          <p className="text-3xl font-bold text-green-300 mt-1.5">
            {formatCurrency(totalIncome)}
          </p>
        </div>
      </Card>

      <Card
        variant="glass"
        className="bg-opacity-10 bg-red-900/10 border border-red-500/20 backdrop-blur-sm"
      >
        <div className="text-center">
          <p className="text-xs text-red-400 uppercase tracking-wider font-semibold">
            {currentPartner}'s Expenses
          </p>
          <p className="text-3xl font-bold text-red-300 mt-1.5">
            {formatCurrency(totalExpenses)}
          </p>
        </div>
      </Card>

      <Card
        variant="glass"
        className={`bg-opacity-10 ${
          balance >= 0
            ? "bg-blue-900/10 border-blue-500/20"
            : "bg-yellow-900/10 border-yellow-500/20"
        } border backdrop-blur-sm`}
      >
        <div className="text-center">
          <p
            className={`text-xs uppercase tracking-wider font-semibold ${
              balance >= 0 ? "text-blue-400" : "text-yellow-400"
            }`}
          >
            {currentPartner}'s Balance
          </p>
          <p
            className={`text-3xl font-bold mt-1.5 ${
              balance >= 0 ? "text-blue-300" : "text-yellow-300"
            }`}
          >
            {formatCurrency(balance)}
          </p>
        </div>
      </Card>
    </div>
  );
};
