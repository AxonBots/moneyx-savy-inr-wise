
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Account } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, 
  Building,  
  PiggyBank, 
  LineChart, 
  Banknote 
} from "lucide-react";

interface AccountsListProps {
  accounts: Account[];
  title?: string;
  showViewAll?: boolean;
  showTotal?: boolean;
}

const AccountsList: React.FC<AccountsListProps> = ({
  accounts,
  title = "Accounts",
  showViewAll = true,
  showTotal = true,
}) => {
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  
  const getAccountIcon = (type: string) => {
    switch (type) {
      case "Checking":
        return <Building className="h-5 w-5 text-gray-600" />;
      case "Savings":
        return <PiggyBank className="h-5 w-5 text-amber-500" />;
      case "Credit":
        return <CreditCard className="h-5 w-5 text-blue-500" />;
      case "Investment":
        return <LineChart className="h-5 w-5 text-purple-500" />;
      default:
        return <Banknote className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg">{title}</CardTitle>
        {showViewAll && (
          <Button variant="link" asChild>
            <Link to="/accounts">View all</Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {showTotal && (
          <div className="mb-4">
            <p className="text-sm text-gray-500">Total Balance</p>
            <p className="text-2xl font-bold">{formatCurrency(totalBalance)}</p>
          </div>
        )}
        
        <div className="space-y-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                {getAccountIcon(account.type)}
                <div>
                  <p className="font-medium">{account.name}</p>
                  <p className="text-xs text-gray-500">{account.type}</p>
                </div>
              </div>
              <p className={`font-medium ${account.balance < 0 ? 'text-red-600' : ''}`}>
                {formatCurrency(account.balance)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountsList;
