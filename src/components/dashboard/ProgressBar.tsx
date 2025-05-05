
import { cn, formatCurrency } from "@/lib/utils";

interface ProgressBarProps {
  label?: string;
  current: number;
  max: number;
  showAmount?: boolean;
  color?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  current,
  max,
  showAmount = true,
  color = "bg-moneyxPrimary",
  className,
  size = "md",
}) => {
  const percentage = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;
  
  const heightClass = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };
  
  return (
    <div className={className}>
      {(label || showAmount) && (
        <div className="flex justify-between text-sm mb-1">
          {label && <span>{label}</span>}
          {showAmount && (
            <span className="text-gray-600">
              {formatCurrency(current)} of {formatCurrency(max)}
            </span>
          )}
        </div>
      )}
      <div className={cn("bg-gray-200 rounded-full overflow-hidden", heightClass[size])}>
        <div
          className={cn("h-full rounded-full", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showAmount && (
        <div className="text-xs text-gray-500 mt-1 text-right">{percentage}% used</div>
      )}
    </div>
  );
};

export default ProgressBar;
