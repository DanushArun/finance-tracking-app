import { useState, useEffect } from "react";
import { useApp } from "../../contexts/AppContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  Transaction,
  TransactionType,
  ReceiptItem,
  RecurringInterval,
} from "../../types";
import { formatCurrency as formatCurrencyUtil } from "../../utils/helpers";
import { useForm, Path, Controller } from "react-hook-form";

interface TransactionFormProps {
  transaction?: Partial<Transaction>;
  onClose: () => void;
  onSubmit: (
    data: Omit<Transaction, "id" | "coupleId" | "userId" | "user" | "isShared">,
  ) => Promise<void>;
  onCancel: () => void;
  initialCategoryName?: string;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  transaction,
  onClose,
  onSubmit,
  onCancel,
  initialCategoryName,
}) => {
  const { categories } = useApp();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [splitTransaction, setSplitTransaction] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    control,
  } = useForm<Transaction>({
    defaultValues: transaction || {
      type: "expense",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      description: "",
      category: initialCategoryName || "",
      categoryId:
        categories.find((c) => c.name === initialCategoryName)?.id || "",
      tags: [],
      notes: "",
      items: [],
      isRecurring: false,
      recurringInterval: "monthly",
    },
  });

  const watchedItems = watch("items") || [];
  const watchedTags = watch("tags") || [];

  useEffect(() => {
    if (transaction) {
      (Object.keys(transaction) as Array<keyof Transaction>).forEach((key) => {
        const value = transaction[key];
        if (value !== undefined) {
          setValue(key as Path<Transaction>, value as any);
        }
      });
      setSplitTransaction(!!transaction.items && transaction.items.length > 0);
    } else if (initialCategoryName) {
      const category = categories.find(
        (c) => c.name === initialCategoryName && c.type === "expense",
      );
      if (category) {
        setValue("categoryId", category.id || "");
        setValue("category", category.name || "");
        setValue("type", "expense");
      }
    }
  }, [transaction, initialCategoryName, categories, setValue]);

  const handleFormSubmit = async (formData: Transaction) => {
    setIsSubmitting(true);
    try {
      const basicTransactionData: Omit<
        Transaction,
        "id" | "coupleId" | "userId" | "user" | "isShared"
      > = {
        type: formData.type as TransactionType,
        amount: Number(formData.amount),
        description: formData.description,
        category: formData.category,
        categoryId: formData.categoryId,
        date: formData.date || new Date().toISOString(),
        tags: formData.tags || [],
        notes: formData.notes || "",
        isRecurring: formData.isRecurring,
        recurringInterval: formData.recurringInterval,
        receipt: formData.receipt,
        location: formData.location,
        items: formData.items,
      };

      if (transaction && transaction.id) {
        console.warn(
          "Update logic in TransactionForm needs to be clarified. Calling generic onSubmit for now.",
        );
        await onSubmit(basicTransactionData);
      } else {
        await onSubmit(basicTransactionData);
      }

      onClose();
    } catch (error) {
      console.error("Error submitting transaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  const handleTypeChange = (newType: TransactionType) => {
    setValue("type", newType);
    const currentCategoryId = watch("categoryId");
    if (currentCategoryId) {
      const category = categories.find((c) => c.id === currentCategoryId);
      if (category && category.type && category.type !== newType) {
        setValue("categoryId", "");
        setValue("category", "");
      }
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value;
    const category = categories.find((c) => c.id === categoryId);
    setValue("categoryId", categoryId);
    setValue("category", category?.name || "");
    if (category?.type) {
      setValue("type", category.type);
    }
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    setValue("tags", [...watchedTags, tagInput.trim()]);
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    setValue(
      "tags",
      watchedTags.filter((tag) => tag !== tagToRemove),
    );
  };

  const addSplitItem = () => {
    const newItem = {
      name: watch("description") || "",
      price: watchedItems.length === 0 ? watch("amount") || 0 : 0,
      quantity: 1,
    };
    setValue("items", [...watchedItems, newItem]);
    if (watchedItems.length === 0) setValue("amount", 0);
  };

  const updateSplitItem = (
    index: number,
    field: keyof ReceiptItem,
    value: string | number,
  ) => {
    const currentItemsState: ReceiptItem[] = Array.isArray(watchedItems)
      ? [...watchedItems]
      : [];

    if (index >= 0 && index < currentItemsState.length) {
      const updatedItems = currentItemsState.map((item, i) => {
        if (i === index) {
          const newItem = { ...item };
          (newItem as any)[field] =
            field === "price" || field === "quantity" ? Number(value) : value;
          return newItem;
        }
        return item;
      });

      setValue("items", updatedItems as ReceiptItem[]);

      if (field === "price" || field === "quantity") {
        const total = updatedItems.reduce(
          (sum, item) =>
            sum + Number(item.price) * (Number(item.quantity) || 1),
          0,
        );
        setValue("amount", total);
      }
    } else {
      console.warn(
        `updateSplitItem: Invalid index ${index} for items array of length ${currentItemsState.length}`,
      );
    }
  };

  const removeSplitItem = (index: number) => {
    const currentItemsState: ReceiptItem[] = Array.isArray(watchedItems)
      ? [...watchedItems]
      : [];
    if (index >= 0 && index < currentItemsState.length) {
      const updatedItems = currentItemsState.filter((_, i) => i !== index);
      setValue("items", updatedItems as ReceiptItem[]);
      const total = updatedItems.reduce(
        (sum, item) => sum + Number(item.price) * (Number(item.quantity) || 1),
        0,
      );
      setValue("amount", total);
    } else {
      console.warn(
        `removeSplitItem: Invalid index ${index} for items array of length ${currentItemsState.length}`,
      );
    }
  };

  const handleSplitTransactionChange = () => {
    const newSplitState = !splitTransaction;
    setSplitTransaction(newSplitState);
    if (newSplitState && watchedItems.length === 0) {
      addSplitItem();
    } else if (!newSplitState && watchedItems.length > 0) {
      const totalFromItems = watchedItems.reduce(
        (sum, item) => sum + Number(item.price) * (Number(item.quantity) || 1),
        0,
      );
      setValue("amount", totalFromItems);
      setValue("items", []);
    } else if (
      !newSplitState &&
      watchedItems.length === 0 &&
      Number(watch("amount")) === 0
    ) {
      // This case is intentionally left blank. If splitting is toggled off
      // and there were no items and the amount was already zero, no action is needed.
      // The user will need to manually input an amount if they wish to proceed without splitting.
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {transaction ? "Edit Transaction" : "New Transaction"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white"
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
          </div>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <label
                className={`flex items-center justify-center border rounded-lg p-3 cursor-pointer ${
                  watch("type") === "expense"
                    ? "bg-red-600/20 border-red-500/50 text-white"
                    : "bg-gray-800/50 border-gray-700 text-gray-400"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value="expense"
                  checked={watch("type") === "expense"}
                  onChange={() => handleTypeChange("expense")}
                  className="sr-only"
                />
                <svg
                  className="w-5 h-5 mr-2"
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
                Expense
              </label>

              <label
                className={`flex items-center justify-center border rounded-lg p-3 cursor-pointer ${
                  watch("type") === "income"
                    ? "bg-green-600/20 border-green-500/50 text-white"
                    : "bg-gray-800/50 border-gray-700 text-gray-400"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value="income"
                  checked={watch("type") === "income"}
                  onChange={() => handleTypeChange("income")}
                  className="sr-only"
                />
                <svg
                  className="w-5 h-5 mr-2"
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
                Income
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={watch("description") || ""}
                  onChange={(e) => setValue("description", e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="What was this for?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    {formatCurrencyUtil(0).charAt(0)}
                  </span>
                  <input
                    type="number"
                    name="amount"
                    step="0.01"
                    value={watch("amount") || ""}
                    onChange={(e) => setValue("amount", Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0.00"
                    disabled={splitTransaction}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Category
                </label>
                <select
                  name="categoryId"
                  value={watch("categoryId") || ""}
                  onChange={handleCategoryChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories
                    .filter((cat) => !cat.type || cat.type === watch("type"))
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={watch("date") || ""}
                  onChange={(e) => setValue("date", e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Tags
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTag())
                  }
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-l-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Add tags (e.g. business, travel)"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="bg-gray-700 text-white py-2 px-4 rounded-r-lg hover:bg-gray-600"
                >
                  Add
                </button>
              </div>

              {watchedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {watchedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded text-sm bg-gray-800 text-gray-300"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-gray-400 hover:text-gray-300"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isRecurring"
                  name="isRecurring"
                  checked={watch("isRecurring") || false}
                  onChange={(e) => setValue("isRecurring", e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-600"
                />
                <label
                  htmlFor="isRecurring"
                  className="ml-2 text-sm text-gray-300"
                >
                  This is a recurring transaction
                </label>
              </div>

              {watch("isRecurring") && (
                <div className="pl-6 border-l-2 border-gray-700">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Recurring Interval
                    </label>
                    <select
                      name="recurringInterval"
                      value={watch("recurringInterval") || "monthly"}
                      onChange={(e) =>
                        setValue(
                          "recurringInterval",
                          e.target.value as RecurringInterval,
                        )
                      }
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="splitExpense"
                  checked={splitTransaction}
                  onChange={handleSplitTransactionChange}
                  className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-600"
                />
                <label
                  htmlFor="splitExpense"
                  className="ml-2 text-sm text-gray-300"
                >
                  Split this transaction into items
                </label>
              </div>

              {splitTransaction && (
                <div className="pl-6 border-l-2 border-gray-700">
                  <div className="mb-2">
                    <button
                      type="button"
                      onClick={addSplitItem}
                      className="text-sm text-purple-400 hover:text-purple-300 flex items-center"
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
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Add Item
                    </button>
                  </div>

                  {watchedItems.length > 0 ? (
                    <div className="space-y-3">
                      {watchedItems.map((item, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-12 gap-2 items-center"
                        >
                          <div className="col-span-5">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) =>
                                updateSplitItem(index, "name", e.target.value)
                              }
                              placeholder="Item name"
                              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                          </div>
                          <div className="col-span-3">
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 flex items-center pl-1 text-gray-500 text-xs">
                                {formatCurrencyUtil(0).charAt(0)}
                              </span>
                              <input
                                type="number"
                                step="0.01"
                                value={item.price}
                                onChange={(e) =>
                                  updateSplitItem(
                                    index,
                                    "price",
                                    e.target.value,
                                  )
                                }
                                placeholder="0.00"
                                className="w-full bg-gray-800 border border-gray-700 rounded pl-4 px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                              />
                            </div>
                          </div>
                          <div className="col-span-3">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity || 1}
                              onChange={(e) =>
                                updateSplitItem(
                                  index,
                                  "quantity",
                                  e.target.value,
                                )
                              }
                              placeholder="Qty"
                              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                          </div>
                          <div className="col-span-1">
                            <button
                              type="button"
                              onClick={() => removeSplitItem(index)}
                              className="text-gray-500 hover:text-red-400"
                            >
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}

                      <div className="text-right text-sm">
                        <span className="text-gray-400">Total: </span>
                        <span className="font-semibold">
                          {formatCurrencyUtil(
                            watchedItems.reduce(
                              (sum, item) =>
                                sum + item.price * (item.quantity || 1),
                              0,
                            ),
                          )}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Add items to split this transaction
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={watch("location") || ""}
                  onChange={(e) => setValue("location", e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Where did this transaction take place?"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={watch("notes") || ""}
                onChange={(e) => setValue("notes", e.target.value)}
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Additional notes..."
              ></textarea>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : transaction ? (
                  "Update"
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
