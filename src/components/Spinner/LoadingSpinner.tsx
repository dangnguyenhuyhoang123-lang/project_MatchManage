type LoadingSpinnerProps = {
  message?: string;
  className?: string;
};

const LoadingSpinner = ({
  message = "Dang tai du lieu...",
  className = "",
}: LoadingSpinnerProps) => {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-slate-50 p-6 ${className}`.trim()}
    >
      <div className="flex flex-col items-center justify-center gap-4 text-slate-600">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-600 border-r-emerald-500 animate-spin" />
        </div>

        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
