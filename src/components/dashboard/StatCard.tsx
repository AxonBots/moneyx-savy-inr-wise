
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, className }) => {
  return (
    <Card className={cn("border shadow-sm", className)}>
      <CardContent className="p-6">
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold mb-1">{value}</p>
        {trend && (
          <p className={cn(
            "text-xs font-medium",
            trend.positive ? "text-green-500" : "text-red-500"
          )}>
            {trend.positive ? "+" : ""}{trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
