type LoadingSpinnerProps = {
  message?: string;
  description?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  fullHeight?: boolean;
};

const LoadingSpinner = ({
  message = "Đang tải dữ liệu...",
  description,
  className = "",
  size = "md",
  fullHeight = false,
}: LoadingSpinnerProps) => {
  const sizeClasses =
    size === "sm"
      ? {
          wrapper: "h-10 w-10",
          border: "border-[3px]",
        }
      : size === "lg"
        ? {
            wrapper: "h-16 w-16",
            border: "border-[5px]",
          }
        : {
            wrapper: "h-12 w-12",
            border: "border-4",
          };

  return (
    <div
      className={`overflow-hidden rounded-[1.75rem] border border-[#0d631b]/10 bg-gradient-to-br from-white via-[#f8faf8] to-[#eef7f0] p-6 shadow-[0_18px_48px_rgba(13,99,27,0.08)] ${
        fullHeight ? "min-h-[240px]" : ""
      } ${className}`.trim()}
    >
      <div
        className={`flex flex-col items-center justify-center gap-4 text-center text-slate-600 ${
          fullHeight ? "min-h-[190px]" : ""
        }`}
      >
        <div className="relative">
          <div className="absolute inset-[-10px] rounded-full bg-[#0d631b]/8 blur-md" />
          <div className={`relative ${sizeClasses.wrapper}`}>
            <div
              className={`absolute inset-0 rounded-full border-[#0d631b]/10 ${sizeClasses.border}`}
            />
            <div
              className={`absolute inset-0 animate-spin rounded-full border-transparent border-t-[#0d631b] border-r-[#41a35f] ${sizeClasses.border}`}
            />
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-bold text-slate-700">{message}</p>
          {description && (
            <p className="max-w-md text-xs font-medium leading-6 text-slate-500">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
