import { Transaction } from "../types";

/**
 * Format a number as Indian Rupee currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date string (YYYY-MM-DD) to a more readable format
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

/**
 * Get the current date in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

/**
 * Get a list of month names
 */
export function getMonthNames(): string[] {
  return [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
}

/**
 * Calculate the total income from a list of transactions
 */
export function calculateTotalIncome(transactions: Transaction[] = []): number {
  return transactions
    .filter((tx) => tx.type === "income")
    .reduce((total, tx) => total + tx.amount, 0);
}

/**
 * Calculate the total expenses from a list of transactions
 */
export function calculateTotalExpenses(
  transactions: Transaction[] = [],
): number {
  return transactions
    .filter((tx) => tx.type === "expense")
    .reduce((total, tx) => total + tx.amount, 0);
}

/**
 * Calculate the balance (income - expenses) from a list of transactions
 */
export function calculateBalance(transactions: Transaction[] = []): number {
  return (
    calculateTotalIncome(transactions) - calculateTotalExpenses(transactions)
  );
}

/**
 * Group transactions by category and calculate total amount per category
 */
export function groupByCategory(
  transactions: Transaction[] = [],
): Record<string, number> {
  const result: Record<string, number> = {};

  transactions.forEach((tx) => {
    if (!result[tx.category]) {
      result[tx.category] = 0;
    }

    // For expenses, add to the total; for income, we typically categorize separately
    if (tx.type === "expense") {
      result[tx.category] += tx.amount;
    }
  });

  return result;
}

/**
 * Get an array of colors for charts
 */
export function getChartColors(): string[] {
  return [
    "#8b5cf6", // Purple
    "#ec4899", // Pink
    "#3b82f6", // Blue
    "#10b981", // Green
    "#f59e0b", // Yellow
    "#ef4444", // Red
    "#6366f1", // Indigo
    "#14b8a6", // Teal
    "#f43f5e", // Rose
    "#0ea5e9", // Light Blue
    "#d946ef", // Fuchsia
  ];
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

/**
 * Truncate a string to a specified length
 */
export function truncateString(str: string, maxLength: number = 25): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Get the contrast color (black or white) based on background color
 */
export function getContrastColor(hexColor: string): string {
  // Remove the hash if it exists
  hexColor = hexColor.replace("#", "");

  // Parse the RGB values
  const r = parseInt(hexColor.substr(0, 2), 16);
  const g = parseInt(hexColor.substr(2, 2), 16);
  const b = parseInt(hexColor.substr(4, 2), 16);

  // Calculate brightness using the formula
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // Return black for light colors and white for dark colors
  return brightness > 155 ? "#000000" : "#ffffff";
}

/**
 * Convert a file to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
