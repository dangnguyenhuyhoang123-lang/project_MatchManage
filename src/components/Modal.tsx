import React, { useEffect } from "react";

type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl" | "full";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  closeOnOverlayClick?: boolean;
  size?: ModalSize;
  className?: string;
  contentClassName?: string;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
  "2xl": "max-w-7xl",
  full: "max-w-[95vw]",
};

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  children,
  closeOnOverlayClick = true,
  size = "md",
  className = "",
  contentClassName = "",
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (open) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      {/* Modal Box */}
      <div
        className={`
          relative z-10 
          w-full 
          ${sizeClasses[size]} 
          max-h-[90vh] 
          overflow-hidden 
          rounded-2xl 
          bg-white 
          shadow-2xl 
          animate-fadeIn
          ${className}
        `}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="
            absolute right-4 top-4 z-20
            flex h-9 w-9 items-center justify-center
            rounded-full
            text-stone-400
            transition
            hover:bg-stone-100
            hover:text-black
          "
        ></button>

        {/* Scrollable Content */}
        <div
          className={`
            max-h-[90vh] 
            overflow-y-auto 
            p-6
            ${contentClassName}
          `}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
