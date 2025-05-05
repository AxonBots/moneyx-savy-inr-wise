
import React, { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  User, Bell, Search, ChevronDown, LogOut
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { getInitials } from "@/lib/utils";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { notifications } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  
  const unreadNotifications = notifications.filter(n => !n.read).length;
  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  
  // If user not logged in, redirect to login
  React.useEffect(() => {
    if (!user && location.pathname !== "/login" && location.pathname !== "/signup") {
      navigate("/login");
    }
  }, [user, location, navigate]);

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header/Navbar */}
        <header className="border-b bg-white px-6 py-3 flex items-center justify-between">
          <div className="w-full max-w-md">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Search transactions, accounts..." 
                className="pl-8 bg-gray-50 border-gray-200" 
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button className="p-1.5 rounded-full hover:bg-gray-100">
                <Bell className="h-5 w-5 text-gray-600" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
            </div>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 font-medium text-gray-700 hover:text-gray-900">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-moneyxPrimary text-white">
                      {getInitials(user.firstName || user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline">{user.firstName || 'User'}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
