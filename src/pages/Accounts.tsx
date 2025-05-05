
import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import Layout from "@/components/layout/Layout";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Building, 
  CreditCard, 
  Edit, 
  LineChart, 
  PiggyBank, 
  Plus, 
  Trash 
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { AccountType } from "@/types";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  balance: z.coerce.number(),
});

type FormData = z.infer<typeof formSchema>;

const Accounts = () => {
  const { accounts, addAccount, deleteAccount } = useData();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "Checking",
      balance: 0,
    },
  });

  const onSubmit = async (data: FormData) => {
    const success = await addAccount({
      name: data.name,
      type: data.type as AccountType,
      balance: data.balance,
    });

    if (success) {
      form.reset();
      setIsAddDialogOpen(false);
    }
  };

  const handleDelete = async () => {
    if (accountToDelete) {
      await deleteAccount(accountToDelete);
      setIsDeleteDialogOpen(false);
      setAccountToDelete(null);
    }
  };

  const confirmDelete = (id: string) => {
    setAccountToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "Checking":
        return <Building className="h-8 w-8 text-gray-600" />;
      case "Savings":
        return <PiggyBank className="h-8 w-8 text-amber-500" />;
      case "Credit":
        return <CreditCard className="h-8 w-8 text-blue-500" />;
      case "Investment":
        return <LineChart className="h-8 w-8 text-purple-500" />;
      default:
        return <Building className="h-8 w-8 text-gray-600" />;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Accounts</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-moneyxPrimary hover:bg-moneyxPrimary/90">
                <Plus className="mr-2 h-4 w-4" /> Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Account</DialogTitle>
                <DialogDescription>
                  Enter the details of your financial account
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Main Checking, Savings, etc." 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select account type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Checking">Checking</SelectItem>
                            <SelectItem value="Savings">Savings</SelectItem>
                            <SelectItem value="Credit">Credit Card</SelectItem>
                            <SelectItem value="Investment">Investment</SelectItem>
                            <SelectItem value="Cash">Cash</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="balance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Balance (₹)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter className="mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-moneyxPrimary hover:bg-moneyxPrimary/90"
                    >
                      Add Account
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold">Net Worth</h2>
              <p className="text-3xl font-bold mt-2">{formatCurrency(totalBalance)}</p>
              <p className="text-sm text-gray-500">Total across all accounts</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-gray-100">
                        {getAccountIcon(account.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{account.name}</h3>
                        <p className="text-sm text-gray-500">{account.type}</p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-600"
                        onClick={() => confirmDelete(account.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className={`text-xl font-bold mt-3 ${account.balance < 0 ? 'text-red-600' : ''}`}>
                    {formatCurrency(account.balance)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this account? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Accounts;
