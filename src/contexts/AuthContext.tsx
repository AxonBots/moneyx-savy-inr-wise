
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Mock authentication - would be replaced with real MySQL auth
  useEffect(() => {
    const storedUser = localStorage.getItem("moneyxUser");
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // In a real app, this would validate against MySQL database
      if (email && password) {
        const mockUser: User = {
          id: "user-123",
          email,
          firstName: "Alex",
          lastName: "Johnson",
          phone: "+1 (555) 123-4567",
          createdAt: new Date(),
        };
        
        setUser(mockUser);
        localStorage.setItem("moneyxUser", JSON.stringify(mockUser));
        
        toast({
          title: "Login successful",
          description: "Welcome to MoneyX!",
        });
        
        return true;
      }
      
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
      
      return false;
    } catch (error) {
      console.error("Login error:", error);
      
      toast({
        title: "Login failed",
        description: "An error occurred during login",
        variant: "destructive",
      });
      
      return false;
    }
  };

  const signup = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string
  ): Promise<boolean> => {
    try {
      // In a real app, this would create a user in MySQL database
      if (email && password) {
        const mockUser: User = {
          id: "user-" + Math.floor(Math.random() * 1000),
          email,
          firstName,
          lastName,
          createdAt: new Date(),
        };
        
        setUser(mockUser);
        localStorage.setItem("moneyxUser", JSON.stringify(mockUser));
        
        toast({
          title: "Account created",
          description: "Welcome to MoneyX!",
        });
        
        return true;
      }
      
      toast({
        title: "Signup failed",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      
      return false;
    } catch (error) {
      console.error("Signup error:", error);
      
      toast({
        title: "Signup failed",
        description: "An error occurred during signup",
        variant: "destructive",
      });
      
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("moneyxUser");
    
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  const updateUser = async (updatedUser: Partial<User>): Promise<boolean> => {
    try {
      if (user) {
        const newUser = { ...user, ...updatedUser };
        setUser(newUser);
        localStorage.setItem("moneyxUser", JSON.stringify(newUser));
        
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully",
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Update user error:", error);
      
      toast({
        title: "Update failed",
        description: "An error occurred while updating your profile",
        variant: "destructive",
      });
      
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};
