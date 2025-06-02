import React, { useState, useRef } from "react";
import { Button } from "../common/Button";
import { Modal } from "../common/Modal";
import { Card } from "../common/Card";
import { useReceiptScanner } from "../../hooks/useReceiptScanner";
import { useTransactions } from "../../hooks/useTransactions";
import { formatCurrency, getTodayDateString } from "../../utils/helpers";
import { TransactionForm } from "../Transactions/TransactionForm";
import { Transaction, ReceiptData, ReceiptItem, Category } from "../../types";
import { useApp } from "../../contexts/AppContext";
import { useAuth } from "../../contexts/AuthContext";

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (
    transactionData: Omit<
      Transaction,
      "id" | "coupleId" | "userId" | "user" | "isShared"
    >,
  ) => void;
}

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({
  isOpen,
  onClose,
  onScanComplete,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [isSelectingFile, setIsSelectingFile] = useState(true);
  const [isReviewingData, setIsReviewingData] = useState(false);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const {
    scanReceipt,
    loading: ocrLoading,
    error: scanError,
    receiptData,
    clearReceiptData,
  } = useReceiptScanner();
  const { categories, addTransaction: addTxFromAppContext } = useApp();
  const { currentUser } = useAuth();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ReceiptData | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const resetState = () => {
    setPreviewURL(null);
    setIsSelectingFile(true);
    setIsReviewingData(false);
    setIsAddingTransaction(false);
    clearReceiptData();

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setScanResult(null);
        setFormError(null);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSelectNewFile = () => {
    resetState();
  };

  const handleProceedToTransaction = () => {
    if (receiptData) {
      setIsReviewingData(false);
      setIsAddingTransaction(true);
    }
  };

  const convertReceiptToTransaction = (
    currentReceiptData: ReceiptData,
  ): Omit<
    Transaction,
    "id" | "coupleId" | "userId" | "user" | "isShared"
  > | null => {
    if (!currentUser || !currentUser.coupleId) {
      setFormError(
        "User or couple information is missing. Cannot prepare transaction.",
      );
      return null;
    }
    if (!currentReceiptData.amount && currentReceiptData.amount !== 0) {
      setFormError("Receipt data is missing an amount.");
      return null;
    }

    const foundCategory = categories.find(
      (c: Category) =>
        currentReceiptData.category &&
        c.name.toLowerCase() === currentReceiptData.category.toLowerCase() &&
        c.type === "expense",
    );

    return {
      type: "expense",
      amount: currentReceiptData.amount || 0,
      description: currentReceiptData.merchant
        ? `Receipt from ${currentReceiptData.merchant}`
        : "Scanned Receipt",
      category:
        foundCategory?.name || currentReceiptData.category || "Uncategorized",
      categoryId: foundCategory?.id || "",
      date: currentReceiptData.date || getTodayDateString(),
      items: currentReceiptData.items || [],
      notes: "Scanned via receipt scanner.",
      tags: [],
      isRecurring: false,
    };
  };

  const handleScan = async () => {
    if (!imageFile) {
      setFormError("Please select an image file to scan.");
      return;
    }
    setIsScanning(true);
    setFormError(null);
    try {
      const result = await scanReceipt(imageFile);
      setScanResult(result);
    } catch (err: any) {
      setFormError(err.message || "Failed to scan receipt.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleConfirmAndAddTransaction = async () => {
    if (!scanResult || !currentUser || !currentUser.coupleId) {
      setFormError(
        "Missing scan result or user/couple information to confirm transaction.",
      );
      return;
    }
    const basicTransactionData = convertReceiptToTransaction(scanResult);
    if (basicTransactionData) {
      try {
        await addTxFromAppContext(basicTransactionData, false, currentUser.uid);
        onScanComplete(basicTransactionData);
        handleClose();
      } catch (error: any) {
        console.error("Error adding scanned transaction:", error);
        setFormError(error.message || "Failed to save transaction.");
      }
    }
  };

  const getInitialTransactionDataForFormReview = ():
    | Partial<Transaction>
    | undefined => {
    if (!scanResult) return undefined;

    const foundCategory = categories.find(
      (cat: Category) =>
        scanResult.category &&
        cat.name.toLowerCase() === scanResult.category.toLowerCase(),
    );

    return {
      type: "expense",
      amount: scanResult.amount || 0,
      description: scanResult.merchant
        ? `Receipt from ${scanResult.merchant}`
        : "Scanned Receipt",
      category: foundCategory?.name || scanResult.category || "Uncategorized",
      categoryId: foundCategory?.id || "",
      date: scanResult.date || getTodayDateString(),
      user: currentUser?.displayName || "User",
      userId: currentUser?.uid || "",
      items: scanResult.items || [],
      notes: "Scanned via receipt scanner.",
      tags: [],
      isRecurring: false,
    };
  };

  // Update the UI state based on the receipt scanning process
  React.useEffect(() => {
    if (receiptData && !isAddingTransaction) {
      setIsReviewingData(true);
    }
  }, [receiptData, isAddingTransaction]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Receipt Scanner"
      maxWidth="lg"
    >
      {isSelectingFile && (
        <div className="text-center py-10">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-4 text-xl font-medium text-gray-200">
              Upload your receipt
            </h3>
            <p className="mt-2 text-sm text-gray-400">
              Take a photo of your receipt and upload it to automatically
              extract transaction details.
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            size="lg"
            className="mx-auto"
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
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            }
          >
            Select Image
          </Button>
        </div>
      )}

      {!isSelectingFile && !isAddingTransaction && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image preview */}
          <div>
            <Card variant="dark-solid" className="p-4">
              <div className="aspect-w-4 aspect-h-5 relative">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Receipt"
                      className="object-contain w-full h-full rounded-lg"
                    />
                    <button
                      onClick={handleSelectNewFile}
                      className="absolute top-2 right-2 bg-gray-900/80 text-red-400 p-1 rounded-full hover:bg-gray-800"
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
                ) : (
                  <div
                    className="h-64 flex flex-col items-center justify-center p-6 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <svg
                      className="w-12 h-12 text-gray-500 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <p className="text-center text-gray-400 mb-1">
                      Drag & drop receipt image or click to browse
                    </p>
                    <p className="text-xs text-gray-500">
                      Supports JPG, PNG, HEIC (max 5MB)
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Receipt data */}
          <div>
            {ocrLoading && (
              <div className="flex flex-col items-center justify-center h-full">
                <svg
                  className="animate-spin h-10 w-10 text-purple-500 mb-4"
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
                <p className="text-gray-300">Scanning your receipt...</p>
                <p className="text-sm text-gray-500 mt-2">
                  This may take a few seconds.
                </p>
              </div>
            )}

            {formError && !ocrLoading && (
              <div className="text-center py-8">
                <svg
                  className="mx-auto h-12 w-12 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-200">
                  Error scanning receipt
                </h3>
                <p className="mt-2 text-sm text-gray-400">{formError}</p>
                <Button
                  onClick={handleSelectNewFile}
                  className="mt-4"
                  variant="secondary"
                >
                  Try Again
                </Button>
              </div>
            )}

            {receiptData && isReviewingData && (
              <div>
                <h3 className="text-xl font-bold text-gray-200 mb-4">
                  Receipt Details
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                    <span className="text-gray-400">Merchant:</span>
                    <span className="text-gray-200 font-medium">
                      {receiptData.merchant}
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-gray-200 font-medium">
                      {formatCurrency(receiptData.amount)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                    <span className="text-gray-400">Date:</span>
                    <span className="text-gray-200 font-medium">
                      {receiptData.date
                        ? new Date(receiptData.date).toLocaleDateString()
                        : "Not detected"}
                    </span>
                  </div>

                  {receiptData.category && (
                    <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                      <span className="text-gray-400">Category:</span>
                      <span className="text-gray-200 font-medium">
                        {receiptData.category}
                      </span>
                    </div>
                  )}

                  {receiptData.items && receiptData.items.length > 0 && (
                    <div>
                      <div className="text-gray-400 mb-2">Items:</div>
                      <ul className="space-y-2 pl-2">
                        {receiptData.items.map((item, idx) => (
                          <li
                            key={idx}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-gray-300">{item.name}</span>
                            <span className="text-gray-400">
                              {formatCurrency(item.price)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <Button
                    onClick={handleProceedToTransaction}
                    fullWidth
                    leftIcon={
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    }
                  >
                    Add as Transaction
                  </Button>

                  <Button
                    onClick={handleSelectNewFile}
                    fullWidth
                    variant="secondary"
                  >
                    Scan Another Receipt
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isAddingTransaction && receiptData && (
        <div>
          <h3 className="text-xl font-bold text-gray-200 mb-4">
            Add Transaction from Receipt
          </h3>

          <TransactionForm
            transaction={getInitialTransactionDataForFormReview()}
            onClose={() => setIsAddingTransaction(false)}
            onSubmit={handleConfirmAndAddTransaction}
            onCancel={() => setIsAddingTransaction(false)}
          />
        </div>
      )}

      {!isSelectingFile &&
        !isAddingTransaction &&
        !imagePreview &&
        !scanResult && (
          <div className="mt-6 p-4 bg-gray-800/70 rounded-lg text-sm text-gray-400">
            <h4 className="font-medium text-gray-300 mb-2">How it works:</h4>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Take a clear photo of your receipt</li>
              <li>Upload the image</li>
              <li>Our OCR technology will extract the transaction details</li>
              <li>Review and confirm the extracted information</li>
              <li>Save to add as a new transaction</li>
            </ol>
          </div>
        )}

      {!isSelectingFile &&
        !isAddingTransaction &&
        imagePreview &&
        !scanResult && (
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleScan}
              disabled={!imageFile || isScanning}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isScanning ? (
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
                  Scanning...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-1"
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
                  Scan Receipt
                </>
              )}
            </button>
          </div>
        )}

      {!isSelectingFile && !isAddingTransaction && scanResult && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Scan Results</h3>

          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Merchant
                </label>
                <p className="font-medium">{scanResult.merchant}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Total Amount
                </label>
                <p className="font-medium">
                  {formatCurrency(scanResult.amount)}
                </p>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Date</label>
                <p className="font-medium">
                  {new Date(scanResult.date || "").toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Category
                </label>
                <p className="font-medium">{scanResult.category}</p>
              </div>
            </div>

            {scanResult.items && scanResult.items.length > 0 && (
              <div>
                <label className="block text-xs text-gray-400 mb-2">
                  Receipt Items
                </label>
                <div className="max-h-48 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="text-xs text-gray-400">
                      <tr>
                        <th className="text-left py-1">Item</th>
                        <th className="text-right py-1">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {scanResult.items.map((item, index) => (
                        <tr key={index}>
                          <td className="py-1">{item.name}</td>
                          <td className="text-right py-1">
                            {formatCurrency(item.price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!isSelectingFile && !isAddingTransaction && scanResult && (
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleConfirmAndAddTransaction}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Use Results
          </button>
        </div>
      )}
    </Modal>
  );
};
