
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, LightbulbIcon, CalendarClock } from "lucide-react";

interface InsightCardProps {
  type: "alert" | "insight" | "reminder";
  title: string;
  description: string;
  className?: string;
}

const InsightCard: React.FC<InsightCardProps> = ({
  type,
  title,
  description,
  className,
}) => {
  const getIcon = () => {
    switch (type) {
      case "alert":
        return (
          <div className="p-2 rounded-full bg-amber-100">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
        );
      case "insight":
        return (
          <div className="p-2 rounded-full bg-blue-100">
            <LightbulbIcon className="h-5 w-5 text-blue-500" />
          </div>
        );
      case "reminder":
        return (
          <div className="p-2 rounded-full bg-purple-100">
            <CalendarClock className="h-5 w-5 text-purple-500" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {getIcon()}
          <div>
            <h3 className="font-medium mb-1">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightCard;
