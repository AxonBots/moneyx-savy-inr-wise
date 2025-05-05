
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bill } from "@/types";
import { formatCurrency, getRelativeDateLabel } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface BillsListProps {
  bills: Bill[];
  title?: string;
  showViewAll?: boolean;
  maxItems?: number;
}

const BillsList: React.FC<BillsListProps> = ({
  bills,
  title = "Upcoming Bills",
  showViewAll = true,
  maxItems = 4,
}) => {
  // Sort bills by due date (closest first)
  const sortedBills = [...bills]
    .filter(bill => !bill.isPaid)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, maxItems);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg">{title}</CardTitle>
        {showViewAll && (
          <Button variant="link" asChild>
            <Link to="/bills">View all</Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedBills.length > 0 ? (
            sortedBills.map((bill) => {
              const daysUntilDue = Math.ceil(
                (bill.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );
              
              return (
                <div
                  key={bill.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">{bill.name}</p>
                    <div className="text-xs text-gray-500">
                      {new Date(bill.dueDate).toLocaleDateString()} {bill.isRecurring && "• Recurring"}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">{formatCurrency(bill.amount)}</p>
                    <p className={`text-xs ${daysUntilDue <= 3 ? "text-red-500" : "text-gray-500"}`}>
                      Due {getRelativeDateLabel(bill.dueDate)}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-4 text-gray-500">No upcoming bills</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BillsList;
