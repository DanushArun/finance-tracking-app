import { useState, useCallback } from "react";
import { analyzeReceiptImage } from "../services/geminiService";
import { fileToBase64 } from "../utils/helpers";
import { ReceiptData } from "../types";

interface ReceiptScannerState {
  loading: boolean;
  error: string | null;
  receiptData: ReceiptData | null;
}

export function useReceiptScanner() {
  const [state, setState] = useState<ReceiptScannerState>({
    loading: false,
    error: null,
    receiptData: null,
  });

  // Process receipt image
  const scanReceipt = useCallback(async (file: File) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Convert file to base64
      const base64Image = await fileToBase64(file);

      // Process image with Gemini API
      const data = await analyzeReceiptImage(base64Image);

      if (data) {
        setState({
          loading: false,
          error: null,
          receiptData: data,
        });
        return data;
      } else {
        setState({
          loading: false,
          error: "Failed to extract data from receipt",
          receiptData: null,
        });
        return null;
      }
    } catch (error) {
      console.error("Error scanning receipt:", error);
      setState({
        loading: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
        receiptData: null,
      });
      return null;
    }
  }, []);

  // Clear receipt data
  const clearReceiptData = useCallback(() => {
    setState({
      loading: false,
      error: null,
      receiptData: null,
    });
  }, []);

  return {
    ...state,
    scanReceipt,
    clearReceiptData,
  };
}
