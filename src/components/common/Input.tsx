import { InputHTMLAttributes, forwardRef, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  variant?: "default" | "filled";
  hideLabel?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      className,
      fullWidth = false,
      variant = "default",
      hideLabel = false,
      disabled,
      id,
      ...props
    },
    ref,
  ) => {
    // Generate a random ID if one is not provided
    const inputId =
      id || `input-${Math.random().toString(36).substring(2, 10)}`;

    // Common text input classes
    const baseInputStyles =
      "bg-gray-800 text-white placeholder-gray-500 rounded-md border-gray-700 focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:ring-opacity-50 disabled:opacity-60 disabled:bg-gray-900 disabled:text-gray-400";

    // Variant styles
    const variantStyles = {
      default: "border",
      filled: "bg-gray-900 border-transparent",
    };

    // Icon padding styles
    const iconPaddingStyles = leftIcon ? "pl-10" : rightIcon ? "pr-10" : "";

    // Error styles
    const errorStyles = error
      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
      : "";

    // Full width style
    const widthStyle = fullWidth ? "w-full" : "";

    // Combine all styles
    const inputStyles = twMerge(
      baseInputStyles,
      variantStyles[variant],
      iconPaddingStyles,
      errorStyles,
      widthStyle,
      "py-2 px-4",
      className,
    );

    return (
      <div className={`${fullWidth ? "w-full" : ""}`}>
        {label && !hideLabel && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-200 mb-1"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={inputStyles}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            {...props}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-red-500">
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-1 text-sm text-gray-400">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
