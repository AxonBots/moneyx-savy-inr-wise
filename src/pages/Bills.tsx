
import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import Layout from "@/components/layout/Layout";
import { formatCurrency, getRelativeDateLabel } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, CheckCircle2, CircleDollarSign, Edit, Plus, Receipt, Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(1, "Bill name is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  dueDate: z.date({ required_error: "Due date is required" }),
  isRecurring: z.boolean().default(false),
  category: z.string().optional(),
  accountId: z.string().min(1, "Account is required"),
});

type FormData = z.infer<typeof formSchema>;

const Bills = () => {
  const { bills, addBill, updateBill, deleteBill, categories, accounts, addTransaction } = useData();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [billToEdit, setBillToEdit] = useState<string | null>(null);
  const [billToDelete, setBillToDelete] = useState<string | null>(null);
  const [billToPay, setBillToPay] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("upcoming");

  // Filter bills
  const upcomingBills = bills.filter(bill => !bill.isPaid);
  const paidBills = bills.filter(bill => bill.isPaid);

  // Forms
  const addForm = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      amount: 0,
      dueDate: new Date(),
      isRecurring: false,
      category: undefined,
      accountId: "",
    },
  });

  const editForm = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      amount: 0,
      dueDate: new Date(),
      isRecurring: false,
      category: undefined,
      accountId: "",
    },
  });

  const payForm = useForm({
    resolver: zodResolver(z.object({
      accountId: z.string().min(1, "Account is required"),
    })),
    defaultValues: {
      accountId: "",
    },
  });

  // Add bill handler
  const onAddSubmit = async (data: FormData) => {
    const category = data.category 
      ? categories.find(c => c.id === data.category) 
      : undefined;

    const success = await addBill({
      name: data.name,
      amount: data.amount,
      dueDate: data.dueDate,
      isRecurring: data.isRecurring,
      isPaid: false,
      category,
    });

    if (success) {
      addForm.reset();
      setIsAddDialogOpen(false);
    }
  };

  // Edit bill handler
  const onEditSubmit = async (data: FormData) => {
    if (billToEdit) {
      const category = data.category 
        ? categories.find(c => c.id === data.category) 
        : undefined;

      const success = await updateBill(billToEdit, {
        name: data.name,
        amount: data.amount,
        dueDate: data.dueDate,
        isRecurring: data.isRecurring,
        category,
      });

      if (success) {
        editForm.reset();
        setIsEditDialogOpen(false);
        setBillToEdit(null);
      }
    }
  };

  // Delete bill handler
  const handleDelete = async () => {
    if (billToDelete) {
      await deleteBill(billToDelete);
      setIsDeleteDialogOpen(false);
      setBillToDelete(null);
    }
  };

  // Pay bill handler
  const handlePayBill = async (values: { accountId: string }) => {
    if (billToPay) {
      const bill = bills.find(b => b.id === billToPay);
      if (bill) {
        // Mark bill as paid
        await updateBill(billToPay, { isPaid: true });
        
        // Record payment as transaction
        await addTransaction({
          date: new Date(),
          amount: -bill.amount,
          description: `Payment for ${bill.name}`,
          category: bill.category || categories.find(c => c.type === "expense") || categories[0],
          accountId: values.accountId,
          type: "expense",
        });
        
        setIsPayDialogOpen(false);
        setBillToPay(null);
        payForm.reset();
      }
    }
  };

  // Open edit dialog
  const openEditDialog = (bill: any) => {
    setBillToEdit(bill.id);
    
    // Find the category ID if it exists
    const categoryId = bill.category ? bill.category.id : undefined;
    
    editForm.reset({
      name: bill.name,
      amount: bill.amount,
      dueDate: new Date(bill.dueDate),
      isRecurring: bill.isRecurring,
      category: categoryId,
      accountId: accounts[0]?.id || "",
    });
    
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (id: string) => {
    setBillToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  // Open pay dialog
  const openPayDialog = (id: string) => {
    setBillToPay(id);
    payForm.reset({
      accountId: accounts[0]?.id || "",
    });
    setIsPayDialogOpen(true);
  };

  // Filter expense categories
  const expenseCategories = categories.filter(cat => cat.type === "expense");

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Bills</h1>
          <Button
            className="bg-moneyxPrimary hover:bg-moneyxPrimary/90 flex items-center gap-2"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4" /> Add Bill
          </Button>
        </div>

        <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-[400px]">
            <TabsTrigger value="upcoming">Upcoming Bills</TabsTrigger>
            <TabsTrigger value="paid">Paid Bills</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="mt-6">
            {upcomingBills.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingBills.map((bill) => {
                  const daysUntilDue = Math.ceil(
                    (new Date(bill.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  );
                  
                  return (
                    <Card key={bill.id} className="border hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <CircleDollarSign className="h-5 w-5 text-moneyxPrimary" />
                            <CardTitle className="text-lg">{bill.name}</CardTitle>
                          </div>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(bill)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => openDeleteDialog(bill.id)}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Amount</span>
                            <span className="font-semibold">{formatCurrency(bill.amount)}</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Due Date</span>
                            <span className={`${daysUntilDue <= 3 ? 'text-red-500 font-medium' : ''}`}>
                              {format(new Date(bill.dueDate), 'MMM d, yyyy')}
                            </span>
                          </div>
                          
                          {bill.category && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Category</span>
                              <div className="flex items-center gap-1">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: bill.category.color }} 
                                />
                                <span>{bill.category.name}</span>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center pt-2">
                            <span className={`text-sm ${daysUntilDue <= 3 ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                              Due {getRelativeDateLabel(new Date(bill.dueDate))}
                            </span>
                            <Button 
                              size="sm" 
                              className="bg-moneyxPrimary hover:bg-moneyxPrimary/90"
                              onClick={() => openPayDialog(bill.id)}
                            >
                              Pay Now
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10">
                <CircleDollarSign className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">No upcoming bills</h3>
                <p className="mt-1 text-gray-500">Add a bill to keep track of your expenses</p>
                <Button
                  className="mt-4 bg-moneyxPrimary hover:bg-moneyxPrimary/90"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  Add Your First Bill
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="paid" className="mt-6">
            {paidBills.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paidBills.map((bill) => (
                  <Card key={bill.id} className="border opacity-70 hover:opacity-100 transition-opacity">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <CardTitle className="text-lg">{bill.name}</CardTitle>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => openDeleteDialog(bill.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Amount</span>
                          <span className="font-semibold">{formatCurrency(bill.amount)}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Due Date</span>
                          <span>{format(new Date(bill.dueDate), 'MMM d, yyyy')}</span>
                        </div>
                        
                        {bill.category && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Category</span>
                            <div className="flex items-center gap-1">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: bill.category.color }} 
                              />
                              <span>{bill.category.name}</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center pt-2">
                          <span className="text-sm text-green-500 font-medium">
                            Paid
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Receipt className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">No paid bills</h3>
                <p className="mt-1 text-gray-500">Bills you've paid will appear here</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Add Bill Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Bill</DialogTitle>
              <DialogDescription>
                Enter details for your upcoming bill
              </DialogDescription>
            </DialogHeader>

            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                <FormField
                  control={addForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bill Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Electricity, Internet, Rent, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addForm.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Due Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {expenseCategories.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: category.color }} 
                                  />
                                  <span>{category.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addForm.control}
                    name="accountId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Associated Account</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an account" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {accounts.map(account => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={addForm.control}
                  name="isRecurring"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Recurring Bill</FormLabel>
                        <FormDescription>
                          Is this a recurring monthly payment?
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-moneyxPrimary hover:bg-moneyxPrimary/90">
                    Add Bill
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Edit Bill Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Bill</DialogTitle>
              <DialogDescription>
                Update the details of your bill
              </DialogDescription>
            </DialogHeader>

            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bill Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Due Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={editForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {expenseCategories.map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: category.color }} 
                                />
                                <span>{category.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="isRecurring"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Recurring Bill</FormLabel>
                        <FormDescription>
                          Is this a recurring monthly payment?
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-moneyxPrimary hover:bg-moneyxPrimary/90">
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this bill? This action cannot be undone.
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
        
        {/* Pay Bill Dialog */}
        <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Pay Bill</DialogTitle>
              <DialogDescription>
                Select the account to pay this bill from
              </DialogDescription>
            </DialogHeader>

            <Form {...payForm}>
              <form onSubmit={payForm.handleSubmit(handlePayBill)} className="space-y-4">
                <FormField
                  control={payForm.control}
                  name="accountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pay From Account</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an account" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {accounts.map(account => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name} ({formatCurrency(account.balance)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsPayDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-moneyxPrimary hover:bg-moneyxPrimary/90">
                    Pay Bill
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Bills;
