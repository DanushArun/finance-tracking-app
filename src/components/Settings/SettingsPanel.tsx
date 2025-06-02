import React, { useState } from "react";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { Select } from "../common/Select";
import { useAuth } from "../../contexts/AuthContext";
import { formatCurrency as formatCurrencyUtil } from "../../utils/helpers";

// Tab types for the settings panel
type SettingsTab = "profile" | "categories" | "budget" | "appearance";

export const SettingsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const { currentUser, signOut } = useAuth();

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "profile",
      label: "Profile",
      icon: (
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
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      id: "categories",
      label: "Categories",
      icon: (
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
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      ),
    },
    {
      id: "budget",
      label: "Budget",
      icon: (
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
            d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: (
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
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Sidebar */}
      <div className="col-span-1">
        <Card variant="glass">
          <div className="flex flex-col divide-y divide-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 p-4 text-left transition-colors hover:bg-gray-800 ${
                  activeTab === tab.id
                    ? "bg-gray-800 text-purple-400"
                    : "text-gray-300"
                }`}
              >
                <span
                  className={
                    activeTab === tab.id ? "text-purple-400" : "text-gray-400"
                  }
                >
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            ))}

            <div className="p-4">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => signOut()}
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
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                }
              >
                Sign Out
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Main content */}
      <div className="col-span-1 md:col-span-3">
        <Card variant="glass">
          {activeTab === "profile" && <ProfileSettings user={currentUser} />}
          {activeTab === "categories" && <CategoriesSettings />}
          {activeTab === "budget" && <BudgetSettings />}
          {activeTab === "appearance" && <AppearanceSettings />}
        </Card>
      </div>
    </div>
  );
};

// Profile Settings Component
const ProfileSettings: React.FC<{ user: any }> = ({ user }) => {
  const [displayName, setDisplayName] = useState<string>(
    user?.displayName || "",
  );
  const [photoURL, setPhotoURL] = useState<string>(user?.photoURL || "");

  const handleUpdateProfile = () => {
    // ToDo: Implement profile update
    console.log("Update profile", { displayName, photoURL });
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>

      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="md:w-1/4 flex flex-col items-center">
          <div className="w-32 h-32 rounded-full bg-gray-700 overflow-hidden mb-4">
            {photoURL ? (
              <img
                src={photoURL}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            )}
          </div>

          <button className="text-sm text-purple-400 hover:text-purple-300">
            Change Avatar
          </button>
        </div>

        <div className="md:w-3/4 space-y-4">
          <Input label="Email" value={user?.email || ""} disabled fullWidth />

          <Input
            label="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            fullWidth
            placeholder="Enter your name"
          />
        </div>
      </div>

      <div className="border-t border-gray-700 pt-6">
        <Button
          onClick={handleUpdateProfile}
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          }
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};

// Categories Settings Component
const CategoriesSettings: React.FC = () => {
  const [categories, setCategories] = useState([
    { id: "1", name: "Food & Dining", icon: "🍔", isCustom: false },
    { id: "2", name: "Transportation", icon: "🚗", isCustom: false },
    { id: "3", name: "Entertainment", icon: "🎬", isCustom: false },
    { id: "4", name: "Shopping", icon: "🛍️", isCustom: false },
    { id: "5", name: "Utilities", icon: "💡", isCustom: false },
    { id: "6", name: "Travel", icon: "✈️", isCustom: true },
  ]);

  const [newCategory, setNewCategory] = useState("");
  const [newIcon, setNewIcon] = useState("📁");

  const icons = [
    "📁",
    "💼",
    "🏠",
    "🚗",
    "🍔",
    "🎬",
    "🛍️",
    "💡",
    "✈️",
    "⚕️",
    "📚",
    "💻",
    "🎮",
    "🎵",
    "👕",
    "🏋️",
    "💰",
    "🎁",
    "👶",
    "🐶",
  ];

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      const newId = Date.now().toString();
      setCategories([
        ...categories,
        { id: newId, name: newCategory, icon: newIcon, isCustom: true },
      ]);
      setNewCategory("");
      setNewIcon("📁");
    }
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter((category) => category.id !== id));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Categories</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between p-3 bg-gray-800 rounded-md"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{category.icon}</span>
              <span>{category.name}</span>
            </div>

            {category.isCustom && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteCategory(category.id)}
                className="text-red-400 hover:text-red-300"
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
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-medium mb-4">Add New Category</h3>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="sm:w-1/4">
            <Select
              label="Icon"
              value={newIcon}
              onChange={(e) => setNewIcon(e.target.value)}
              fullWidth
            >
              {icons.map((icon) => (
                <option key={icon} value={icon}>
                  {icon}
                </option>
              ))}
            </Select>
          </div>

          <div className="sm:w-2/4">
            <Input
              label="Category Name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter category name"
              fullWidth
            />
          </div>

          <div className="sm:w-1/4 flex items-end">
            <Button
              onClick={handleAddCategory}
              fullWidth
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
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Budget Settings Component
const BudgetSettings: React.FC = () => {
  const [budgets, setBudgets] = useState([
    { id: "1", category: "Food & Dining", limit: 500 },
    { id: "2", category: "Transportation", limit: 300 },
    { id: "3", category: "Entertainment", limit: 200 },
  ]);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [budgetLimit, setBudgetLimit] = useState("");

  const categoryOptions = [
    "Food & Dining",
    "Transportation",
    "Entertainment",
    "Shopping",
    "Utilities",
    "Travel",
  ];

  const handleAddBudget = () => {
    if (selectedCategory && budgetLimit) {
      const newId = Date.now().toString();
      setBudgets([
        ...budgets,
        { id: newId, category: selectedCategory, limit: Number(budgetLimit) },
      ]);
      setSelectedCategory("");
      setBudgetLimit("");
    }
  };

  const handleUpdateBudget = (id: string, newLimit: number) => {
    setBudgets(
      budgets.map((budget) =>
        budget.id === id ? { ...budget, limit: newLimit } : budget,
      ),
    );
  };

  const handleDeleteBudget = (id: string) => {
    setBudgets(budgets.filter((budget) => budget.id !== id));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Budget Settings</h2>

      <div className="space-y-4 mb-6">
        {budgets.map((budget) => (
          <div
            key={budget.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-800 rounded-md gap-3"
          >
            <div>
              <h3 className="font-medium text-white">{budget.category}</h3>
              <p className="text-sm text-gray-400">Monthly Budget</p>
            </div>

            <div className="flex items-center gap-3">
              <Input
                value={budget.limit.toString()}
                onChange={(e) =>
                  handleUpdateBudget(budget.id, Number(e.target.value))
                }
                type="number"
                min="0"
                className="w-28"
                leftIcon={
                  <span className="text-gray-400">
                    {formatCurrencyUtil(0).charAt(0)}
                  </span>
                }
              />

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteBudget(budget.id)}
                className="text-red-400 hover:text-red-300"
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
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-medium mb-4">Add New Budget</h3>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="sm:w-2/4">
            <Select
              label="Category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              fullWidth
            >
              <option value="" disabled>
                Select a category
              </option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </div>

          <div className="sm:w-1/4">
            <Input
              label="Monthly Limit"
              value={budgetLimit}
              onChange={(e) => setBudgetLimit(e.target.value)}
              type="number"
              min="0"
              placeholder="Amount"
              fullWidth
              leftIcon={
                <span className="text-gray-400">
                  {formatCurrencyUtil(0).charAt(0)}
                </span>
              }
            />
          </div>

          <div className="sm:w-1/4 flex items-end">
            <Button
              onClick={handleAddBudget}
              fullWidth
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
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Appearance Settings Component
const AppearanceSettings: React.FC = () => {
  const [themePreference, setThemePreference] = useState("dark");
  const [accentColor, setAccentColor] = useState("purple");
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  const accentColors = [
    { id: "purple", name: "Purple", class: "bg-purple-500" },
    { id: "blue", name: "Blue", class: "bg-blue-500" },
    { id: "green", name: "Green", class: "bg-green-500" },
    { id: "red", name: "Red", class: "bg-red-500" },
    { id: "amber", name: "Amber", class: "bg-amber-500" },
    { id: "pink", name: "Pink", class: "bg-pink-500" },
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Appearance Settings</h2>

      <div className="space-y-8">
        {/* Theme Preference */}
        <div>
          <h3 className="text-lg font-medium mb-4">Theme</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={`p-4 border ${
                themePreference === "dark"
                  ? "border-purple-500 bg-gray-800"
                  : "border-gray-700 bg-gray-900"
              } rounded-lg cursor-pointer`}
              onClick={() => setThemePreference("dark")}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Dark Mode</span>
                {themePreference === "dark" && (
                  <svg
                    className="w-5 h-5 text-purple-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="bg-gray-950 rounded h-16 border border-gray-800"></div>
            </div>

            <div
              className={`p-4 border ${
                themePreference === "light"
                  ? "border-purple-500 bg-gray-800"
                  : "border-gray-700 bg-gray-900"
              } rounded-lg cursor-pointer`}
              onClick={() => setThemePreference("light")}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Light Mode</span>
                {themePreference === "light" && (
                  <svg
                    className="w-5 h-5 text-purple-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="bg-gray-100 rounded h-16 border border-gray-200"></div>
            </div>
          </div>
        </div>

        {/* Accent Color */}
        <div>
          <h3 className="text-lg font-medium mb-4">Accent Color</h3>

          <div className="flex flex-wrap gap-3">
            {accentColors.map((color) => (
              <button
                key={color.id}
                className={`w-10 h-10 rounded-full flex items-center justify-center ${color.class} ${
                  accentColor === color.id
                    ? "ring-2 ring-white ring-offset-2 ring-offset-gray-900"
                    : ""
                }`}
                onClick={() => setAccentColor(color.id)}
                title={color.name}
              >
                {accentColor === color.id && (
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Animations */}
        <div>
          <h3 className="text-lg font-medium mb-4">Animations</h3>

          <div className="flex items-center">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={animationsEnabled}
                onChange={(e) => setAnimationsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              <span className="ml-3 text-gray-300">Enable animations</span>
            </label>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6">
          <Button
            onClick={() =>
              console.log("Save appearance settings", {
                themePreference,
                accentColor,
                animationsEnabled,
              })
            }
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            }
          >
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
};
