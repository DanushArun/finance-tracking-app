import { HTMLAttributes, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

// Omit 'title' from HTMLAttributes to avoid type conflicts since we redefine it
interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  children: ReactNode;
  title?: string | ReactNode;
  description?: string;
  footer?: ReactNode;
  variant?: "default" | "outline" | "elevated" | "glass" | "dark-solid";
  noPadding?: boolean;
  hoverable?: boolean;
  glowEffect?: boolean;
  titleGradient?: boolean;
  titleIcon?: ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  description,
  footer,
  variant = "default",
  noPadding = false,
  hoverable = false,
  glowEffect = false,
  titleGradient = false,
  titleIcon,
  className,
  headerClassName,
  bodyClassName,
  footerClassName,
  ...props
}) => {
  // Base styles for the card
  const baseStyles = "rounded-lg overflow-hidden";

  // Variant styles
  const variantStyles = {
    default: "bg-gray-800/40 backdrop-blur-md border border-white/10",
    outline: "bg-transparent backdrop-blur-md border border-gray-700/50",
    elevated:
      "bg-gray-800/40 backdrop-blur-md shadow-lg border border-white/10",
    glass:
      "bg-gray-800/30 backdrop-blur-lg border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]",
    "dark-solid": "bg-gray-900/60 backdrop-blur-md",
  };

  // Hover styles
  const hoverStyles = hoverable
    ? "transition-transform duration-200 hover:scale-[1.01] hover:shadow-lg hover:bg-opacity-40"
    : "";

  // Glow effect styles
  const glowStyles = glowEffect
    ? "relative before:absolute before:inset-0 before:-z-10 before:rounded-lg before:bg-gradient-to-r before:from-purple-600/20 before:via-transparent before:to-blue-600/20 before:p-1 before:blur-xl"
    : "";

  // Combine all card styles
  const cardStyles = twMerge(
    baseStyles,
    variantStyles[variant],
    hoverStyles,
    glowStyles,
    className,
  );

  // Header styles
  const defaultHeaderStyles = "px-4 py-3 border-b border-gray-700";
  const headerStyles = twMerge(defaultHeaderStyles, headerClassName);

  // Body styles
  const defaultBodyStyles = noPadding ? "" : "p-4";
  const bodyStyles = twMerge(defaultBodyStyles, bodyClassName);

  // Footer styles
  const defaultFooterStyles = "px-4 py-3 border-t border-gray-700";
  const footerStyles = twMerge(defaultFooterStyles, footerClassName);

  return (
    <div className={cardStyles} {...props}>
      {title && (
        <div className={headerStyles}>
          <div className="flex items-center gap-2">
            {titleIcon && <span className="text-purple-500">{titleIcon}</span>}
            {typeof title === "string" ? (
              <h3
                className={`text-lg font-bold font-heading ${titleGradient ? "bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent" : "text-white"}`}
              >
                {title}
              </h3>
            ) : (
              title
            )}
          </div>
          {description && (
            <p className="text-sm text-gray-400 mt-1">{description}</p>
          )}
        </div>
      )}

      <div className={bodyStyles}>{children}</div>

      {footer && <div className={footerStyles}>{footer}</div>}
    </div>
  );
};
