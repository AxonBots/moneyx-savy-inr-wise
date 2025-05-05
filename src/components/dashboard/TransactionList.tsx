
import { Link } from "react-router-dom";
import { Transaction } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TransactionListProps {
  transactions: Transaction[];
  title?: string;
  showViewAll?: boolean;
  maxItems?: number;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  title = "Recent Transactions",
  showViewAll = true,
  maxItems = 5,
}) => {
  const displayTransactions = transactions.slice(0, maxItems);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg">{title}</CardTitle>
        {showViewAll && (
          <Button variant="link" asChild>
            <Link to="/transactions">View all</Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayTransactions.length > 0 ? (
            displayTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className={`h-2 w-2 rounded-full mr-3 ${
                      transaction.type === "income" ? "bg-moneyxGreen" : 
                      transaction.type === "expense" ? "bg-moneyxRed" : "bg-moneyxBlue"
                    }`}
                  />
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <div className="text-xs text-gray-500">
                      {formatDate(transaction.date)} • {transaction.category.name}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-medium ${
                      transaction.type === "income"
                        ? "text-green-600"
                        : transaction.type === "expense"
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : transaction.type === "expense" ? "-" : ""}
                    {formatCurrency(Math.abs(transaction.amount))}
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">No transactions found</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionList;
