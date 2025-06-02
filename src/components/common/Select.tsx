import { SelectHTMLAttributes, forwardRef, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  variant?: "default" | "filled";
  hideLabel?: boolean;
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
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
      options = [],
      id,
      ...props
    },
    ref,
  ) => {
    // Generate a random ID if one is not provided
    const selectId =
      id || `select-${Math.random().toString(36).substring(2, 10)}`;

    // Common select input classes
    const baseSelectStyles =
      "appearance-none bg-gray-800 text-white rounded-md border-gray-700 focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:ring-opacity-50 disabled:opacity-60 disabled:bg-gray-900 disabled:text-gray-400";

    // Variant styles
    const variantStyles = {
      default: "border",
      filled: "bg-gray-900 border-transparent",
    };

    // Icon padding styles - we'll always have a right icon for the dropdown arrow
    const iconPaddingStyles = leftIcon ? "pl-10 pr-10" : "pr-10";

    // Error styles
    const errorStyles = error
      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
      : "";

    // Full width style
    const widthStyle = fullWidth ? "w-full" : "";

    // Combine all styles
    const selectStyles = twMerge(
      baseSelectStyles,
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
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-200 mb-1 font-heading"
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

          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={selectStyles}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={
              error
                ? `${selectId}-error`
                : hint
                  ? `${selectId}-hint`
                  : undefined
            }
            {...props}
          >
            {options && options.length > 0
              ? options.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </option>
                ))
              : props.children}
          </select>

          {/* Custom dropdown arrow */}
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
            {rightIcon || (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </div>

        {error && (
          <p id={`${selectId}-error`} className="mt-1 text-sm text-red-500">
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={`${selectId}-hint`} className="mt-1 text-sm text-gray-400">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
