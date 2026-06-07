type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
};

export default function ErrorState({
  title = "Đã xảy ra lỗi",
  message = "Không thể tải dữ liệu. Vui lòng thử lại.",
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={`rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-center ${className}`}
    >
      <p className="text-sm font-semibold text-red-700">{title}</p>
      <p className="mt-1 text-sm text-red-600">{message}</p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
        >
          Thử lại
        </button>
      )}
    </div>
  );
}
