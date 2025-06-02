import React, { useState, useEffect, useRef } from "react";
import { Transaction, TransactionType } from "../../types";

interface VoiceInputModalProps {
  onClose: () => void;
  onTransactionDetected: (transaction: Partial<Transaction>) => void;
}

export const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
  onClose,
  onTransactionDetected,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Partial<Transaction> | null>(null);
  const [error, setError] = useState("");

  // Reference to the Speech Recognition API
  const recognitionRef = useRef<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    // Check if browser supports speech recognition
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      setError(
        "Speech recognition is not supported in your browser. Try using Chrome or Edge.",
      );
      return;
    }

    // Create speech recognition instance
    // @ts-ignore
    window.SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (window.SpeechRecognition) {
      recognitionRef.current = new window.SpeechRecognition();

      // Configure recognition
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      // Event handlers
      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setError(`Error: ${event.error}`);
        setIsListening(false);
      };
    }

    // Clean up
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Toggle listening
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript("");
      setResult(null);
      setError("");
      recognitionRef.current?.start();
    }
  };

  // Process the transcript
  const processTranscript = async () => {
    if (!transcript.trim()) {
      setError("No speech detected. Please try again.");
      return;
    }

    setProcessing(true);

    try {
      // In a real app, you would send the transcript to a natural language processing service
      // For this demo, we'll use a simple regex-based approach
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API delay

      const parsedTransaction = parseTranscriptionToTransaction(transcript);

      if (parsedTransaction) {
        setResult(parsedTransaction);
      } else {
        setError(
          "Could not understand the transaction. Please try again with a clearer statement.",
        );
      }
    } catch (err) {
      console.error("Error processing transcript:", err);
      setError("Error processing voice input. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  // Simple NLP to parse transaction from transcript
  const parseTranscriptionToTransaction = (
    text: string,
  ): Partial<Transaction> | null => {
    text = text.toLowerCase();

    // Determine transaction type
    let type: TransactionType = "expense"; // Default
    if (
      text.includes("earned") ||
      text.includes("received") ||
      text.includes("got paid") ||
      text.includes("income")
    ) {
      type = "income";
    }

    // Extract amount - look for patterns like "$50" or "50 dollars"
    const amountRegex = /\$?(\d+(\.\d{1,2})?)\s?(dollars?|bucks?)?/i;
    const amountMatch = text.match(amountRegex);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : null;

    if (!amount) return null;

    // Extract potential categories
    const categories = {
      food: [
        "grocery",
        "groceries",
        "food",
        "restaurant",
        "dining",
        "lunch",
        "dinner",
        "breakfast",
        "meal",
        "takeout",
      ],
      transportation: [
        "gas",
        "fuel",
        "uber",
        "lyft",
        "taxi",
        "car",
        "bus",
        "train",
        "transport",
        "travel",
      ],
      shopping: [
        "clothes",
        "clothing",
        "shopping",
        "amazon",
        "online",
        "bought",
        "purchase",
      ],
      entertainment: [
        "movie",
        "netflix",
        "spotify",
        "entertainment",
        "game",
        "subscription",
      ],
      housing: ["rent", "mortgage", "housing", "apartment"],
      utilities: ["electric", "water", "internet", "phone", "bill", "utility"],
      income: [
        "salary",
        "paycheck",
        "income",
        "work",
        "job",
        "earned",
        "client",
      ],
    };

    let category = "";
    let categoryId = "";

    for (const [cat, keywords] of Object.entries(categories)) {
      if (keywords.some((keyword) => text.includes(keyword))) {
        category = cat;
        categoryId = cat; // In a real app, this would be a real category ID
        break;
      }
    }

    // Default to "Other" if no category found
    if (!category) {
      category = "Other";
      categoryId = "other";
    }

    // Extract description - use the whole text but clean it up
    const descriptionWords = text
      .replace(/\$?(\d+(\.\d{1,2})?)\s?(dollars?|bucks?)?/g, "") // Remove amount
      .replace(/spent|paid|for|on|at/g, "") // Remove common verbs
      .trim()
      .split(" ")
      .filter((word) => word.length > 2); // Remove short words

    const description =
      descriptionWords.length > 0
        ? descriptionWords[0].charAt(0).toUpperCase() +
          descriptionWords[0].slice(1)
        : type === "income"
          ? "Income"
          : "Expense";

    return {
      type,
      amount,
      description,
      category,
      categoryId,
      date: new Date().toISOString().split("T")[0],
    };
  };

  const handleUseResult = () => {
    if (result) {
      onTransactionDetected(result);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-lg">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Voice Transaction Entry</h2>
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

        <div className="p-6">
          {error && (
            <div className="mb-6 p-3 bg-red-900/20 border border-red-800/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="mb-8 text-center">
            <button
              onClick={toggleListening}
              className={`w-24 h-24 rounded-full flex items-center justify-center ${
                isListening
                  ? "bg-red-500 animate-pulse"
                  : "bg-purple-600 hover:bg-purple-700"
              } transition-colors`}
            >
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </button>

            <p className="mt-4 text-gray-300">
              {isListening ? "Listening..." : "Tap to speak"}
            </p>
          </div>

          {transcript && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                You said:
              </h3>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p className="text-gray-300">{transcript}</p>
              </div>

              {!result && !processing && (
                <button
                  onClick={processTranscript}
                  className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                >
                  Process Speech
                </button>
              )}

              {processing && (
                <div className="mt-4 flex items-center text-sm text-gray-400">
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
                  Processing your speech...
                </div>
              )}
            </div>
          )}

          {result && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                Detected Transaction:
              </h3>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Type
                    </label>
                    <p
                      className={`font-medium ${result.type === "income" ? "text-green-400" : "text-red-400"}`}
                    >
                      {result.type === "income" ? "Income" : "Expense"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Amount
                    </label>
                    <p className="font-medium">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(result.amount || 0)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Description
                    </label>
                    <p className="font-medium">{result.description}</p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Category
                    </label>
                    <p className="font-medium capitalize">{result.category}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>

            {result && (
              <button
                onClick={handleUseResult}
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
                Use Transaction
              </button>
            )}
          </div>

          {!isListening && !transcript && (
            <div className="mt-6 p-4 bg-gray-800/70 rounded-lg text-sm text-gray-400">
              <h4 className="font-medium text-gray-300 mb-2">
                Try saying something like:
              </h4>
              <ul className="space-y-1">
                <li>"I spent $45 on groceries at Walmart"</li>
                <li>"Paid $12.50 for lunch yesterday"</li>
                <li>"$80 for gas at Shell"</li>
                <li>"Received $1500 from client payment"</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
