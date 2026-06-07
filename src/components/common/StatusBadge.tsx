import type { StatusTone } from "../../utils/statusUtils";
import type { ReactNode } from "react";

type StatusBadgeProps = {
  label: string;
  tone?: StatusTone;
  className?: string;
  children?: ReactNode;
};

const toneClassName: Record<StatusTone, string> = {
  default: "bg-gray-100 text-gray-700 border-gray-200",
  success: "bg-green-100 text-green-700 border-green-200",
  warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
  danger: "bg-red-100 text-red-700 border-red-200",
  info: "bg-blue-100 text-blue-700 border-blue-200",
};

export default function StatusBadge({
  label,
  tone = "default",
  className = "",
  children,
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${toneClassName[tone]} ${className}`}
    >
      {children ?? label}
    </span>
  );
}
