
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SavingsGoal } from "@/types";
import { formatCurrency, calculatePercentage } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProgressBar from "./ProgressBar";

interface GoalsListProps {
  goals: SavingsGoal[];
  title?: string;
  showViewAll?: boolean;
  maxItems?: number;
}

const GoalsList: React.FC<GoalsListProps> = ({
  goals,
  title = "Savings Goals",
  showViewAll = true,
  maxItems = 3,
}) => {
  const displayGoals = goals.slice(0, maxItems);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg">{title}</CardTitle>
        {showViewAll && (
          <Button variant="link" asChild>
            <Link to="/goals">View all</Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {displayGoals.length > 0 ? (
            displayGoals.map((goal) => {
              const percentage = calculatePercentage(goal.currentAmount, goal.targetAmount);
              const remainingAmount = goal.targetAmount - goal.currentAmount;
              
              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: goal.color || "#3b82f6" }}
                    />
                    <span className="font-medium">{goal.name}</span>
                  </div>
                  
                  <ProgressBar
                    current={goal.currentAmount}
                    max={goal.targetAmount}
                    color={goal.color || "bg-moneyxPrimary"}
                    showAmount={false}
                  />
                  
                  <div className="flex justify-between text-sm">
                    <div>
                      <span className="font-medium">Saved</span>
                      <p>{formatCurrency(goal.currentAmount)}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">Target</span>
                      <p>{formatCurrency(goal.targetAmount)}</p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    {formatCurrency(remainingAmount)} left to save
                    {goal.targetDate && (
                      <> • Target date: {goal.targetDate.toLocaleDateString()}</>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-4 text-gray-500">No savings goals</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalsList;
