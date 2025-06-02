import { useState, useEffect } from "react";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { Select } from "../common/Select";
import { Modal } from "../common/Modal";
import { GoalCard } from "./GoalCard";
import { Goal } from "../../types";
import { formatCurrency as formatCurrencyUtil } from "../../utils/helpers";
import { useApp } from "../../contexts/AppContext";
import { useAuth } from "../../contexts/AuthContext";

export const GoalsPage: React.FC = () => {
  const {
    goals: contextGoals,
    addGoal,
    updateGoal,
    deleteGoal,
    categories,
  } = useApp();
  const { currentUser } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState<string>("");

  // Form state for adding/editing goals
  const [formData, setFormData] = useState<Partial<Goal>>({
    name: "",
    targetAmount: 0,
    currentAmount: 0,
    targetDate: "",
    startDate: new Date().toISOString().split("T")[0],
    category: "",
    iconEmoji: "🎯",
    color: "purple",
  });

  useEffect(() => {
    if (contextGoals && contextGoals.length > 0) {
      setGoals(contextGoals);
    } else if (currentUser?.coupleId) {
      const mockCoupleId = currentUser.coupleId;
      setGoals([
        {
          id: "1",
          name: "New Car",
          targetAmount: 25000,
          currentAmount: 12500,
          targetDate: "2025-12-31",
          startDate: new Date().toISOString().split("T")[0],
          category: "Transportation",
          iconEmoji: "🚗",
          color: "blue",
          coupleId: mockCoupleId,
        },
        {
          id: "2",
          name: "Emergency Fund",
          targetAmount: 10000,
          currentAmount: 7500,
          targetDate: new Date(new Date().setDate(new Date().getDate() + 365))
            .toISOString()
            .split("T")[0],
          startDate: new Date().toISOString().split("T")[0],
          category: "Savings",
          iconEmoji: "🛡️",
          color: "purple",
          coupleId: mockCoupleId,
        },
        {
          id: "3",
          name: "Vacation",
          targetAmount: 5000,
          currentAmount: 2000,
          targetDate: "2025-06-15",
          startDate: new Date().toISOString().split("T")[0],
          category: "Travel",
          iconEmoji: "✈️",
          color: "green",
          coupleId: mockCoupleId,
        },
        {
          id: "4",
          name: "New Laptop",
          targetAmount: 2000,
          currentAmount: 500,
          targetDate: "2025-08-01",
          startDate: new Date().toISOString().split("T")[0],
          category: "Electronics",
          iconEmoji: "��",
          color: "amber",
          coupleId: mockCoupleId,
        },
      ]);
    }
  }, [contextGoals, currentUser]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "targetAmount" || name === "currentAmount") {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleOpenModal = (goal?: Goal) => {
    if (goal) {
      setSelectedGoal(goal);
      setFormData({
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        targetDate: goal.targetDate || "",
        startDate: goal.startDate || new Date().toISOString().split("T")[0],
        category: goal.category || "",
        iconEmoji: goal.iconEmoji || "🎯",
        color: goal.color || "purple",
      });
    } else {
      setSelectedGoal(null);
      setFormData({
        name: "",
        targetAmount: 0,
        currentAmount: 0,
        targetDate: "",
        startDate: new Date().toISOString().split("T")[0],
        category: "",
        iconEmoji: "🎯",
        color: "purple",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGoal(null);
  };

  const handleSaveGoal = async (
    goalDataToSave: Omit<
      Goal,
      "id" | "currentAmount" | "isCompleted" | "coupleId"
    > & { id?: string },
  ) => {
    if (!currentUser?.coupleId) {
      console.error("Cannot save goal: User is not associated with a couple.");
      return;
    }

    if (selectedGoal && selectedGoal.id) {
      const updatedGoalData: Partial<Goal> = {
        ...goalDataToSave,
        coupleId: currentUser.coupleId,
      };
      await updateGoal(selectedGoal.id, updatedGoalData);
    } else {
      const newGoalData: Omit<Goal, "id" | "currentAmount" | "isCompleted"> = {
        ...goalDataToSave,
        coupleId: currentUser.coupleId,
      };
      await addGoal(newGoalData);
    }
    handleCloseModal();
  };

  const handleDeleteClick = (goalId: string) => {
    setGoalToDelete(goalId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (goalToDelete) {
      deleteGoal(goalToDelete);
      setIsDeleteModalOpen(false);
      setGoalToDelete(null);
    }
  };

  const handleContributeClick = (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (goal) {
      setSelectedGoal(goal);
      setContributionAmount("");
      setIsContributeModalOpen(true);
    }
  };

  const handleConfirmContribution = async () => {
    if (
      selectedGoal &&
      selectedGoal.id &&
      contributionAmount &&
      currentUser?.coupleId
    ) {
      const amount = parseFloat(contributionAmount);
      if (!isNaN(amount) && amount > 0) {
        const newCurrentAmount = selectedGoal.currentAmount + amount;
        const updatedGoalPayload: Partial<Goal> = {
          currentAmount: newCurrentAmount,
          isCompleted: newCurrentAmount >= selectedGoal.targetAmount,
        };

        await updateGoal(selectedGoal.id, updatedGoalPayload);

        setIsContributeModalOpen(false);
        setSelectedGoal(null);
        setContributionAmount("");
      }
    } else {
      console.error(
        "Cannot contribute: Missing goal data, contribution amount, or user coupleId.",
      );
    }
  };

  // Available emojis for goals
  const emojis = [
    "🎯",
    "💰",
    "🏠",
    "🚗",
    "✈️",
    "💻",
    "📱",
    "👕",
    "🎓",
    "🏋️",
    "🎮",
    "🎁",
    "🛡️",
    "💍",
    "👶",
    "🐶",
    "🏥",
    "🎭",
    "🎨",
    "📚",
  ];

  // Available colors for goals
  const colors = [
    { value: "purple", label: "Purple" },
    { value: "blue", label: "Blue" },
    { value: "green", label: "Green" },
    { value: "amber", label: "Amber" },
    { value: "red", label: "Red" },
    { value: "pink", label: "Pink" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Financial Goals</h1>
          <p className="text-gray-400">Track and manage your savings goals</p>
        </div>

        <Button
          onClick={() => handleOpenModal()}
          leftIcon={
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
          }
        >
          Add New Goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <Card className="text-center py-12">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-white mb-2">
              No goals yet
            </h3>
            <p className="text-gray-400 mb-6">
              Create your first financial goal to start tracking your progress
            </p>
            <Button
              onClick={() => handleOpenModal()}
              leftIcon={
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
              }
            >
              Add New Goal
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleOpenModal}
              onDelete={handleDeleteClick}
              onContribute={handleContributeClick}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Goal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedGoal ? "Edit Goal" : "Add New Goal"}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Goal Title"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                placeholder="e.g., New Car, Emergency Fund"
                fullWidth
                required
              />
            </div>

            <Input
              label="Target Amount"
              name="targetAmount"
              type="number"
              min="0"
              step="0.01"
              value={formData.targetAmount || ""}
              onChange={handleInputChange}
              fullWidth
              required
              leftIcon={
                <span className="text-gray-400">
                  {formatCurrencyUtil(0).charAt(0)}
                </span>
              }
            />

            <Input
              label="Current Amount"
              name="currentAmount"
              type="number"
              min="0"
              step="0.01"
              value={formData.currentAmount || ""}
              onChange={handleInputChange}
              fullWidth
              leftIcon={
                <span className="text-gray-400">
                  {formatCurrencyUtil(0).charAt(0)}
                </span>
              }
            />

            <Input
              label="Deadline (Optional)"
              name="targetDate"
              type="date"
              value={formData.targetDate || ""}
              onChange={handleInputChange}
              fullWidth
            />

            <Input
              label="Category (Optional)"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              placeholder="e.g., Savings, Travel"
              fullWidth
            />

            <Select
              label="Icon"
              name="iconEmoji"
              value={formData.iconEmoji}
              onChange={handleInputChange}
              fullWidth
            >
              {emojis.map((emoji) => (
                <option key={emoji} value={emoji}>
                  {emoji} {emoji === "🎯" ? "(Default)" : ""}
                </option>
              ))}
            </Select>

            <Select
              label="Color"
              name="color"
              value={formData.color}
              onChange={handleInputChange}
              fullWidth
            >
              {colors.map((color) => (
                <option key={color.value} value={color.value}>
                  {color.label} {color.value === "purple" ? "(Default)" : ""}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button
            onClick={() =>
              handleSaveGoal(
                formData as Omit<
                  Goal,
                  "id" | "currentAmount" | "isCompleted" | "coupleId"
                >,
              )
            }
            fullWidth
            disabled={
              !formData.name ||
              formData.targetAmount === undefined ||
              formData.targetAmount <= 0
            }
          >
            {selectedGoal ? "Update Goal" : "Create Goal"}
          </Button>

          <Button variant="secondary" onClick={handleCloseModal} fullWidth>
            Cancel
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            Are you sure you want to delete this goal? This action cannot be
            undone.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button variant="danger" fullWidth onClick={handleConfirmDelete}>
              Delete
            </Button>

            <Button
              variant="secondary"
              fullWidth
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Contribute Modal */}
      <Modal
        isOpen={isContributeModalOpen}
        onClose={() => setIsContributeModalOpen(false)}
        title="Add Contribution"
        size="sm"
      >
        <div className="space-y-4">
          {selectedGoal && (
            <>
              <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                <div
                  className={`w-10 h-10 rounded-lg bg-${selectedGoal.color || "purple"}-500 flex items-center justify-center text-lg`}
                >
                  {selectedGoal.iconEmoji || "🎯"}
                </div>
                <div>
                  <h3 className="font-medium text-white">
                    {selectedGoal.name}
                  </h3>
                  <div className="text-sm text-gray-400">
                    {formatCurrencyUtil(selectedGoal.currentAmount)} of{" "}
                    {formatCurrencyUtil(selectedGoal.targetAmount)}
                  </div>
                </div>
              </div>

              <Input
                label="Contribution Amount"
                type="number"
                min="0.01"
                step="0.01"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
                fullWidth
                autoFocus
                leftIcon={
                  <span className="text-gray-400">
                    {formatCurrencyUtil(0).charAt(0)}
                  </span>
                }
              />

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  fullWidth
                  onClick={handleConfirmContribution}
                  disabled={
                    !contributionAmount || parseFloat(contributionAmount) <= 0
                  }
                >
                  Add Contribution
                </Button>

                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setIsContributeModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};
