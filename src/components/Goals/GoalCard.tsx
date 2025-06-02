import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { formatCurrency } from "../../utils/helpers";
import { Goal } from "../../types"; // Import global Goal type

interface GoalCardProps {
  goal: Goal; // Use global Goal type
  onEdit?: (goal: Goal) => void; // Use global Goal type
  onDelete?: (goalId: string) => void;
  onContribute?: (goalId: string) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onEdit,
  onDelete,
  onContribute,
}) => {
  const {
    id,
    name: title, // Map name to title from global Goal type
    targetAmount,
    currentAmount,
    targetDate: deadline, // Map targetDate to deadline from global Goal type
    category,
    iconEmoji,
    color = "purple",
  } = goal;

  // Calculate the progress percentage
  const progressPercentage = Math.min(
    100,
    Math.round((currentAmount / targetAmount) * 100),
  );

  // Format the deadline date if it exists
  const formattedDeadline = deadline
    ? new Date(deadline).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  // Calculate days remaining if deadline exists
  const daysRemaining = deadline
    ? Math.ceil(
        (new Date(deadline).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  // Get color classes based on the goal's color
  const getColorClasses = () => {
    switch (color) {
      case "blue":
        return {
          bg: "bg-blue-500",
          darkBg: "bg-blue-600",
          text: "text-blue-400",
          progress: "bg-blue-500",
          overlay: "from-blue-500/30 to-transparent",
        };
      case "green":
        return {
          bg: "bg-green-500",
          darkBg: "bg-green-600",
          text: "text-green-400",
          progress: "bg-green-500",
          overlay: "from-green-500/30 to-transparent",
        };
      case "amber":
        return {
          bg: "bg-amber-500",
          darkBg: "bg-amber-600",
          text: "text-amber-400",
          progress: "bg-amber-500",
          overlay: "from-amber-500/30 to-transparent",
        };
      case "red":
        return {
          bg: "bg-red-500",
          darkBg: "bg-red-600",
          text: "text-red-400",
          progress: "bg-red-500",
          overlay: "from-red-500/30 to-transparent",
        };
      case "pink":
        return {
          bg: "bg-pink-500",
          darkBg: "bg-pink-600",
          text: "text-pink-400",
          progress: "bg-pink-500",
          overlay: "from-pink-500/30 to-transparent",
        };
      case "purple":
      default:
        return {
          bg: "bg-purple-500",
          darkBg: "bg-purple-600",
          text: "text-purple-400",
          progress: "bg-purple-500",
          overlay: "from-purple-500/30 to-transparent",
        };
    }
  };

  const colorClasses = getColorClasses();

  return (
    <Card variant="glass" className="relative overflow-hidden" noPadding={true}>
      {/* Color overlay */}
      <div
        className={`absolute top-0 left-0 w-full h-24 bg-gradient-to-b ${colorClasses.overlay} opacity-70 pointer-events-none`}
      />

      {/* Icon */}
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl ${colorClasses.bg} flex items-center justify-center text-xl`}
            >
              {iconEmoji || "🎯"}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{title}</h3>
              {category && <p className="text-sm text-gray-400">{category}</p>}
            </div>
          </div>

          <div className="flex gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="p-1"
                onClick={() => onEdit(goal)}
                aria-label="Edit goal"
              >
                <svg
                  className="w-5 h-5 text-gray-500 hover:text-gray-300"
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
              </Button>
            )}

            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="p-1"
                onClick={() => onDelete(id!)}
                aria-label="Delete goal"
              >
                <svg
                  className="w-5 h-5 text-gray-500 hover:text-red-500"
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
              </Button>
            )}
          </div>
        </div>

        {/* Progress section */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm">Progress</span>
            <span className={`font-semibold ${colorClasses.text}`}>
              {progressPercentage}%
            </span>
          </div>

          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${colorClasses.progress} rounded-full transition-all duration-500 ease-out`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-sm mt-2">
            <span className="text-gray-400">
              {formatCurrency(currentAmount)}
            </span>
            <span className="text-white">{formatCurrency(targetAmount)}</span>
          </div>

          {/* Time remaining */}
          {daysRemaining !== null && (
            <div className="mt-3 text-sm text-gray-400">
              {daysRemaining > 0 ? (
                <div className="flex items-center gap-1">
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
                      strokeWidth={1.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>
                    {daysRemaining} days left ({formattedDeadline})
                  </span>
                </div>
              ) : (
                <span className="text-red-400">
                  Deadline passed ({formattedDeadline})
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {onContribute && (
        <div className="p-3 bg-gray-800 border-t border-gray-700">
          <Button
            variant="outline"
            size="sm"
            fullWidth
            className={`border-${color}-600 text-${color}-400 hover:bg-${color}-900/20`}
            onClick={() => onContribute(id!)}
          >
            <span className="flex items-center gap-1">
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
                  strokeWidth={1.5}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Contribute
            </span>
          </Button>
        </div>
      )}
    </Card>
  );
};
