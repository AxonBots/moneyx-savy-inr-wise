
import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
});

const securityFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileFormSchema>;
type SecurityFormData = z.infer<typeof securityFormSchema>;

const Settings = () => {
  const { user, updateUser } = useAuth();
  const { preferences, updatePreferences } = useData();
  const [activeTab, setActiveTab] = useState("profile");

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  const securityForm = useForm<SecurityFormData>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    await updateUser({
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
    });
  };

  const onSecuritySubmit = async (data: SecurityFormData) => {
    // In a real app, this would update the password in the database
    console.log("Password updated:", data);
  };

  const handleCurrencyChange = (value: string) => {
    updatePreferences({ currency: value });
  };

  const handleDateFormatChange = (value: string) => {
    updatePreferences({ dateFormat: value });
  };

  const handleDarkModeToggle = (value: boolean) => {
    updatePreferences({ darkMode: value });
  };

  const handleNotificationChange = (key: keyof typeof preferences.notifications, value: boolean) => {
    updatePreferences({
      notifications: {
        ...preferences.notifications,
        [key]: value,
      },
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 max-w-[400px]">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
              <p className="text-gray-500 mb-6">Update your personal information.</p>

              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={profileForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="First name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="name@example.com" {...field} readOnly />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit"
                    className="bg-moneyxPrimary hover:bg-moneyxPrimary/90"
                  >
                    Save Changes
                  </Button>
                </form>
              </Form>
            </div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="mt-6">
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Display Preferences</h2>
              <p className="text-gray-500 mb-6">Customize how your financial data is displayed.</p>

              <div className="space-y-6">
                <div className="space-y-2">
                  <FormLabel>Default Currency</FormLabel>
                  <Select
                    value={preferences.currency}
                    onValueChange={handleCurrencyChange}
                  >
                    <SelectTrigger className="w-full md:w-[240px]">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="GBP">British Pound (£)</SelectItem>
                      <SelectItem value="JPY">Japanese Yen (¥)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <FormLabel>Date Format</FormLabel>
                  <Select
                    value={preferences.dateFormat}
                    onValueChange={handleDateFormatChange}
                  >
                    <SelectTrigger className="w-full md:w-[240px]">
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between space-y-0 rounded-md border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Dark Mode</FormLabel>
                    <div className="text-sm text-gray-500">
                      Enable dark mode for the application
                    </div>
                  </div>
                  <Switch
                    checked={preferences.darkMode}
                    onCheckedChange={handleDarkModeToggle}
                  />
                </div>

                <Button 
                  className="bg-moneyxPrimary hover:bg-moneyxPrimary/90"
                >
                  Save Preferences
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="mt-6">
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Notification Settings</h2>
              <p className="text-gray-500 mb-6">Manage your notification preferences.</p>

              <div className="space-y-4">
                <div className="flex items-center justify-between space-y-0 rounded-md border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Low Balance Alerts</FormLabel>
                    <div className="text-sm text-gray-500">
                      Get notified when your account balance falls below a threshold.
                    </div>
                  </div>
                  <Switch
                    checked={preferences.notifications.lowBalance}
                    onCheckedChange={(value) => handleNotificationChange("lowBalance", value)}
                  />
                </div>

                <div className="flex items-center justify-between space-y-0 rounded-md border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Bill Reminders</FormLabel>
                    <div className="text-sm text-gray-500">
                      Receive reminders about upcoming bill due dates.
                    </div>
                  </div>
                  <Switch
                    checked={preferences.notifications.billReminders}
                    onCheckedChange={(value) => handleNotificationChange("billReminders", value)}
                  />
                </div>

                <div className="flex items-center justify-between space-y-0 rounded-md border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Large Transaction Alerts</FormLabel>
                    <div className="text-sm text-gray-500">
                      Be notified of unusually large transactions.
                    </div>
                  </div>
                  <Switch
                    checked={preferences.notifications.largeTransactions}
                    onCheckedChange={(value) => handleNotificationChange("largeTransactions", value)}
                  />
                </div>

                <div className="flex items-center justify-between space-y-0 rounded-md border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Weekly Summary</FormLabel>
                    <div className="text-sm text-gray-500">
                      Get a weekly summary of your finances.
                    </div>
                  </div>
                  <Switch
                    checked={preferences.notifications.weeklySummary}
                    onCheckedChange={(value) => handleNotificationChange("weeklySummary", value)}
                  />
                </div>

                <div className="flex items-center justify-between space-y-0 rounded-md border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">AI Insights</FormLabel>
                    <div className="text-sm text-gray-500">
                      Receive personalized financial insights and tips.
                    </div>
                  </div>
                  <Switch
                    checked={preferences.notifications.aiInsights}
                    onCheckedChange={(value) => handleNotificationChange("aiInsights", value)}
                  />
                </div>

                <Button 
                  className="bg-moneyxPrimary hover:bg-moneyxPrimary/90 mt-4"
                >
                  Save Notification Settings
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-6">
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Security Settings</h2>
              <p className="text-gray-500 mb-6">Manage your account security settings.</p>

              <Form {...securityForm}>
                <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6">
                  <FormField
                    control={securityForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={securityForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={securityForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-between space-y-0 rounded-md border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Two-Factor Authentication</FormLabel>
                      <div className="text-sm text-gray-500">
                        Add an extra layer of security to your account.
                      </div>
                    </div>
                    <Switch />
                  </div>

                  <Button 
                    type="submit"
                    className="bg-moneyxPrimary hover:bg-moneyxPrimary/90"
                  >
                    Update Security Settings
                  </Button>
                </form>
              </Form>
              
              <div className="mt-12 pt-6 border-t border-gray-200">
                <h3 className="text-red-600 font-semibold mb-2">Danger Zone</h3>
                <p className="text-gray-500 mb-4">Irreversible actions related to your account.</p>
                <Button variant="destructive">Delete Account</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
