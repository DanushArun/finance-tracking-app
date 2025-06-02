import { useEffect, useRef, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { createPortal } from "react-dom";
import { Button } from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string | ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  maxWidth?: string; // Custom max-width (overrides size)
  closeOnOutsideClick?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  backdropClassName?: string;
  preventScroll?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  maxWidth,
  closeOnOutsideClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  className,
  headerClassName,
  bodyClassName,
  footerClassName,
  backdropClassName,
  preventScroll = true,
  ...props
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle ESC key to close the modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && closeOnEsc && e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Prevent body scrolling when modal is open
    if (isOpen && preventScroll) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);

      // Restore body scrolling when modal is closed
      if (preventScroll) {
        document.body.style.overflow = "";
      }
    };
  }, [isOpen, closeOnEsc, onClose, preventScroll]);

  // Handle outside click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      closeOnOutsideClick &&
      modalRef.current &&
      !modalRef.current.contains(e.target as Node)
    ) {
      onClose();
    }
  };

  // Size classes for the modal
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-full",
  };

  // Don't render if modal is not open
  if (!isOpen) return null;

  // Modal backdrop
  const backdropClasses = twMerge(
    "fixed inset-0 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm z-50",
    backdropClassName,
  );

  // Modal content
  const modalClasses = twMerge(
    "bg-gray-900 rounded-lg shadow-xl overflow-hidden w-full",
    !maxWidth ? sizeClasses[size] : "",
    "transition-all duration-300 ease-out transform",
    className,
  );

  // Create a portal to render the modal at the end of the document body
  return createPortal(
    <div className={backdropClasses} onClick={handleBackdropClick}>
      <div
        ref={modalRef}
        className={modalClasses}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {title && (
          <div
            className={twMerge(
              "flex items-center justify-between p-4 border-b border-gray-700",
              headerClassName,
            )}
          >
            <div className="text-xl font-semibold text-white" id="modal-title">
              {title}
            </div>

            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                aria-label="Close modal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Button>
            )}
          </div>
        )}

        <div className={twMerge("p-4", bodyClassName)}>{children}</div>

        {footer && (
          <div
            className={twMerge(
              "p-4 border-t border-gray-700 flex justify-end space-x-2",
              footerClassName,
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};
