type EmptyStateProps = {
  title?: string;
  description?: string;
  className?: string;
};

export default function EmptyState({
  title = "Chưa có dữ liệu",
  description,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center ${className}`}
    >
      <p className="text-sm font-medium text-gray-700">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
    </div>
  );
}
