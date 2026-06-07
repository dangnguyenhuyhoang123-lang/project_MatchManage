type LoadingStateProps = {
  message?: string;
  className?: string;
};

export default function LoadingState({
  message = "Đang tải dữ liệu...",
  className = "",
}: LoadingStateProps) {
  return (
    <div
      className={`flex items-center justify-center py-8 text-sm text-gray-500 ${className}`}
    >
      {message}
    </div>
  );
}
