import { ReceiptData } from "../types";

// In a real application, you would use the actual Gemini API client
// For development purposes, we're creating a mock implementation

const MOCK_MODE = !process.env.REACT_APP_GEMINI_API_KEY;

// Define a function to analyze receipt images using Gemini's vision capabilities
export async function analyzeReceiptImage(
  imageBase64: string,
): Promise<ReceiptData> {
  // Remove the base64 prefix if present
  const base64Content = imageBase64.includes(",")
    ? imageBase64.split(",")[1]
    : imageBase64;

  if (MOCK_MODE) {
    // For mock mode, simulate API latency
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Return mock receipt data
    return {
      merchant: "Sample Store",
      amount: 1250.75,
      date: new Date().toISOString().split("T")[0],
      category: "Groceries",
      items: [
        { name: "Fresh Vegetables", price: 350.5, quantity: 1 },
        { name: "Bread", price: 120.25, quantity: 2 },
        { name: "Milk", price: 85.0, quantity: 1 },
        { name: "Rice", price: 495.0, quantity: 1 },
        { name: "Eggs", price: 200.0, quantity: 1 },
      ],
    };
  }

  try {
    // In a real implementation, you would call the Gemini API here
    // This would involve sending the image to Gemini's API endpoint
    // and processing the response

    // For example:
    // const response = await fetch('https://api.gemini.ai/v1/analyze-receipt', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${process.env.REACT_APP_GEMINI_API_KEY}`
    //   },
    //   body: JSON.stringify({ image: base64Content })
    // });
    //
    // if (!response.ok) {
    //   throw new Error(`API error: ${response.status}`);
    // }
    //
    // const data = await response.json();
    // return data as ReceiptData;

    // For now, return mock data
    return {
      merchant: "Sample Store",
      amount: 1250.75,
      date: new Date().toISOString().split("T")[0],
      category: "Groceries",
      items: [
        { name: "Fresh Vegetables", price: 350.5, quantity: 1 },
        { name: "Bread", price: 120.25, quantity: 2 },
        { name: "Milk", price: 85.0, quantity: 1 },
        { name: "Rice", price: 495.0, quantity: 1 },
        { name: "Eggs", price: 200.0, quantity: 1 },
      ],
    };
  } catch (error) {
    console.error("Error analyzing receipt:", error);
    throw new Error("Failed to analyze receipt image");
  }
}

// Function to suggest a category based on merchant name or items
export async function suggestCategory(
  merchant: string,
  items: string[] = [],
): Promise<string> {
  if (MOCK_MODE) {
    // Simulate API latency
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simple merchant-based category suggestion logic
    const merchantLower = merchant.toLowerCase();

    if (
      merchantLower.includes("grocery") ||
      merchantLower.includes("market") ||
      merchantLower.includes("store")
    ) {
      return "Groceries";
    } else if (
      merchantLower.includes("restaurant") ||
      merchantLower.includes("cafe") ||
      merchantLower.includes("food")
    ) {
      return "Dining Out";
    } else if (
      merchantLower.includes("pharmacy") ||
      merchantLower.includes("medical") ||
      merchantLower.includes("doctor")
    ) {
      return "Healthcare";
    } else if (
      merchantLower.includes("transport") ||
      merchantLower.includes("travel") ||
      merchantLower.includes("uber")
    ) {
      return "Transportation";
    } else if (
      merchantLower.includes("amazon") ||
      merchantLower.includes("shop") ||
      merchantLower.includes("mart")
    ) {
      return "Shopping";
    } else {
      return "Other";
    }
  }

  try {
    // In a real implementation, you would call the Gemini API here
    // For example:
    // const response = await fetch('https://api.gemini.ai/v1/suggest-category', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${process.env.REACT_APP_GEMINI_API_KEY}`
    //   },
    //   body: JSON.stringify({ merchant, items })
    // });
    //
    // if (!response.ok) {
    //   throw new Error(`API error: ${response.status}`);
    // }
    //
    // const data = await response.json();
    // return data.category;

    // For now, use the same mock logic
    const merchantLower = merchant.toLowerCase();

    if (
      merchantLower.includes("grocery") ||
      merchantLower.includes("market") ||
      merchantLower.includes("store")
    ) {
      return "Groceries";
    } else if (
      merchantLower.includes("restaurant") ||
      merchantLower.includes("cafe") ||
      merchantLower.includes("food")
    ) {
      return "Dining Out";
    } else if (
      merchantLower.includes("pharmacy") ||
      merchantLower.includes("medical") ||
      merchantLower.includes("doctor")
    ) {
      return "Healthcare";
    } else if (
      merchantLower.includes("transport") ||
      merchantLower.includes("travel") ||
      merchantLower.includes("uber")
    ) {
      return "Transportation";
    } else if (
      merchantLower.includes("amazon") ||
      merchantLower.includes("shop") ||
      merchantLower.includes("mart")
    ) {
      return "Shopping";
    } else {
      return "Other";
    }
  } catch (error) {
    console.error("Error suggesting category:", error);
    return "Other";
  }
}
