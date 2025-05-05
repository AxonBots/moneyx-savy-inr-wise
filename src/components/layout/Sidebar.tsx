
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard,
  Receipt,
  Wallet,
  Goal,
  Settings,
  IndianRupee,
  CalendarClock
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const pathname = location.pathname;
  
  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Transactions",
      path: "/transactions",
      icon: <Receipt className="h-5 w-5" />,
    },
    {
      name: "Accounts",
      path: "/accounts",
      icon: <Wallet className="h-5 w-5" />,
    },
    {
      name: "Bills",
      path: "/bills",
      icon: <CalendarClock className="h-5 w-5" />,
    },
    {
      name: "Goals",
      path: "/goals",
      icon: <Goal className="h-5 w-5" />,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <aside className="bg-white border-r border-gray-200 w-64 flex flex-col">
      <div className="p-4 flex items-center gap-2 border-b">
        <div className="h-8 w-8 bg-moneyxPrimary text-white rounded-md flex items-center justify-center">
          <IndianRupee className="h-5 w-5" />
        </div>
        <span className="font-bold text-lg">MoneyX</span>
      </div>
      
      <nav className="flex-1 px-2 py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-all",
                  pathname === item.path || pathname.startsWith(`${item.path}/`)
                    ? "bg-moneyxPrimary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 text-xs text-gray-500 border-t">
        <div>MoneyX v1.0.0</div>
      </div>
    </aside>
  );
};

export default Sidebar;
