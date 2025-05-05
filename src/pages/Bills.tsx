
import React, { useState } from "react";
import { useData } from "@/contexts/DataContext";
import Layout from "@/components/layout/Layout";
import { Bill, Category } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CalendarIcon, Check, Clock, FileText, Plus, Trash, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(1, "Bill name is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  dueDate: z.date({
    required_error: "Due date is required",
  }),
  isRecurring: z.boolean().default(false),
  recurrenceType: z.enum([
    "weekly", 
    "biweekly", 
    "monthly", 
    "bimonthly", 
    "quarterly", 
    "semiannually",
    "annually"
  ]).optional(),
  categoryId: z.string().optional(),
  accountId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const Bills = () => {
  const { bills, categories, accounts, addBill, updateBill, deleteBill, addTransaction } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [showPaid, setShowPaid] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      amount: 0,
      dueDate: new Date(),
      isRecurring: false,
      categoryId: undefined,
      accountId: undefined,
    },
  });

  const upcomingBills = bills.filter((bill) => !bill.isPaid);
  const paidBills = bills.filter((bill) => bill.isPaid);

  const watchIsRecurring = form.watch("isRecurring");

  const resetForm = () => {
    form.reset({
      name: "",
      amount: 0,
      dueDate: new Date(),
      isRecurring: false,
      recurrenceType: undefined,
      categoryId: undefined,
      accountId: undefined,
    });
    setEditingBill(null);
  };

  const handleBillAction = (bill: Bill, action: "pay" | "edit" | "delete") => {
    if (action === "pay") {
      markAsPaid(bill);
    } else if (action === "edit") {
      setEditingBill(bill);
      form.reset({
        name: bill.name,
        amount: bill.amount,
        dueDate: new Date(bill.dueDate),
        isRecurring: bill.isRecurring,
        recurrenceType: bill.recurrenceType,
        categoryId: bill.category?.id,
        accountId: bill.accountId,
      });
      setIsDialogOpen(true);
    }
  };

  const markAsPaid = async (bill: Bill) => {
    if (bill.accountId) {
      // If the bill has an account associated, create a transaction
      await addTransaction({
        date: new Date(),
        amount: -bill.amount, // Negative amount for expense
        description: `Payment for ${bill.name}`,
        category: bill.category || categories.find(c => c.name === "Bills") || categories[0],
        accountId: bill.accountId,
        type: "expense",
      });
    }
    
    // Update bill status to paid
    await updateBill(bill.id, { isPaid: true });
  };

  const onSubmit = async (data: FormValues) => {
    if (editingBill) {
      // Editing existing bill
      const selectedCategory = data.categoryId 
        ? categories.find(c => c.id === data.categoryId) 
        : undefined;
        
      await updateBill(editingBill.id, {
        name: data.name,
        amount: data.amount,
        dueDate: data.dueDate,
        isRecurring: data.isRecurring,
        recurrenceType: data.isRecurring ? data.recurrenceType : undefined,
        category: selectedCategory,
        accountId: data.accountId,
      });
    } else {
      // Adding new bill
      const selectedCategory = data.categoryId 
        ? categories.find(c => c.id === data.categoryId) 
        : undefined;
        
      await addBill({
        name: data.name,
        amount: data.amount,
        dueDate: data.dueDate,
        isRecurring: data.isRecurring,
        recurrenceType: data.isRecurring ? data.recurrenceType : undefined,
        category: selectedCategory,
        isPaid: false,
        accountId: data.accountId,
      });
    }
    
    resetForm();
    setIsDialogOpen(false);
  };

  const formatRecurrenceType = (type?: string) => {
    if (!type) return "N/A";
    
    switch(type) {
      case "weekly": return "Weekly";
      case "biweekly": return "Every 2 weeks";
      case "monthly": return "Monthly";
      case "bimonthly": return "Every 2 months";
      case "quarterly": return "Every 3 months";
      case "semiannually": return "Every 6 months";
      case "annually": return "Yearly";
      default: return type;
    }
  };

  const getDaysUntilDue = (dueDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDateObj = new Date(dueDate);
    dueDateObj.setHours(0, 0, 0, 0);
    
    const diffTime = dueDateObj.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Bills</h1>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-moneyxPrimary hover:bg-moneyxPrimary/90">
                <Plus className="mr-2 h-4 w-4" /> Add Bill
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingBill ? "Edit Bill" : "Add New Bill"}</DialogTitle>
                <DialogDescription>
                  {editingBill ? "Update the details of your bill" : "Enter the details for your new bill"}
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
                        <FormLabel>Bill Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Rent, Electricity, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount (₹)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="0.00" 
                              type="number" 
                              step="0.01"
                              min="0" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Due Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "pl-3 text-left font-normal",
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
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                className={cn("p-3 pointer-events-auto")}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="isRecurring"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center gap-2 rounded-lg border p-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div>
                          <FormLabel>Recurring Bill</FormLabel>
                          <FormDescription>
                            This bill repeats on a regular schedule
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {watchIsRecurring && (
                    <FormField
                      control={form.control}
                      name="recurrenceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recurrence Schedule</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="biweekly">Every 2 Weeks</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="bimonthly">Every 2 Months</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="semiannually">Every 6 Months</SelectItem>
                              <SelectItem value="annually">Annually</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            How often this bill needs to be paid
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category (Optional)</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories
                              .filter(cat => cat.type === "expense")
                              .map(category => (
                                <SelectItem 
                                  key={category.id} 
                                  value={category.id}
                                >
                                  {category.name}
                                </SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="accountId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pay From Account (Optional)</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {accounts.map(account => (
                              <SelectItem 
                                key={account.id} 
                                value={account.id}
                              >
                                {account.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the account you'll use to pay this bill
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter className="mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        resetForm();
                        setIsDialogOpen(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-moneyxPrimary hover:bg-moneyxPrimary/90"
                    >
                      {editingBill ? "Update Bill" : "Add Bill"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between px-6">
                <CardTitle className="text-lg">Upcoming Bills</CardTitle>
                <div>
                  {paidBills.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPaid(!showPaid)}
                    >
                      {showPaid ? "Hide Paid Bills" : "Show Paid Bills"}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="px-6">
                {upcomingBills.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <FileText className="h-6 w-6 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No upcoming bills</h3>
                    <p className="mt-1 text-gray-500">
                      You don't have any unpaid bills at the moment.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {upcomingBills.map((bill) => {
                      const daysUntilDue = getDaysUntilDue(bill.dueDate);
                      const isPastDue = daysUntilDue < 0;
                      const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 3;
                      const account = bill.accountId ? accounts.find(a => a.id === bill.accountId) : null;
                      
                      return (
                        <div key={bill.id} className="py-4 flex items-center justify-between">
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              <h3 className="font-medium">{bill.name}</h3>
                              {bill.isRecurring && (
                                <div className="ml-2 text-xs rounded bg-blue-100 text-blue-800 px-2 py-1 flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatRecurrenceType(bill.recurrenceType)}
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {isPastDue ? (
                                <span className="text-red-500 font-medium flex items-center">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Overdue by {Math.abs(daysUntilDue)} days
                                </span>
                              ) : isDueSoon ? (
                                <span className="text-amber-500 font-medium">
                                  Due in {daysUntilDue} {daysUntilDue === 1 ? 'day' : 'days'}
                                </span>
                              ) : (
                                <span>
                                  Due in {daysUntilDue} days ({formatDate(bill.dueDate)})
                                </span>
                              )}
                            </div>
                            {account && (
                              <div className="text-xs text-gray-500 mt-1">
                                Pay from: {account.name}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="font-medium">{formatCurrency(bill.amount)}</div>
                              {bill.category && (
                                <div className="text-xs text-gray-500 mt-1 flex items-center justify-end">
                                  <div
                                    className="w-2 h-2 rounded-full mr-1"
                                    style={{ backgroundColor: bill.category.color }}
                                  />
                                  {bill.category.name}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-2 text-green-600 hover:bg-green-50 hover:text-green-700"
                                onClick={() => handleBillAction(bill, "pay")}
                              >
                                <Check className="h-3.5 w-3.5 mr-1" />
                                Pay
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-2"
                                onClick={() => handleBillAction(bill, "edit")}
                              >
                                Edit
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 px-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                                  >
                                    <Trash className="h-3.5 w-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Bill</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{bill.name}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-600 hover:bg-red-700"
                                      onClick={() => deleteBill(bill.id)}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Paid Bills Section */}
                {showPaid && paidBills.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">Paid Bills</h3>
                    <div className="divide-y">
                      {paidBills.map((bill) => (
                        <div key={bill.id} className="py-4 flex items-center justify-between opacity-70">
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              <h3 className="font-medium">{bill.name}</h3>
                              {bill.isRecurring && (
                                <div className="ml-2 text-xs rounded bg-blue-100 text-blue-800 px-2 py-1 flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatRecurrenceType(bill.recurrenceType)}
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              Paid on {formatDate(new Date())}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="font-medium">{formatCurrency(bill.amount)}</div>
                              {bill.category && (
                                <div className="text-xs text-gray-500 mt-1 flex items-center justify-end">
                                  <div
                                    className="w-2 h-2 rounded-full mr-1"
                                    style={{ backgroundColor: bill.category.color }}
                                  />
                                  {bill.category.name}
                                </div>
                              )}
                            </div>
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2 text-green-600"
                              disabled
                            >
                              <Check className="h-3.5 w-3.5 mr-1" />
                              Paid
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bill Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total monthly bills:</span>
                    <span className="font-medium">
                      {formatCurrency(
                        upcomingBills.reduce((sum, bill) => sum + bill.amount, 0)
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Bills due this week:</span>
                    <span className="font-medium">
                      {upcomingBills.filter(bill => getDaysUntilDue(bill.dueDate) <= 7 && getDaysUntilDue(bill.dueDate) >= 0).length}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Recurring bills:</span>
                    <span className="font-medium">
                      {upcomingBills.filter(bill => bill.isRecurring).length}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Overdue bills:</span>
                    <span className="font-medium text-red-600">
                      {upcomingBills.filter(bill => getDaysUntilDue(bill.dueDate) < 0).length}
                    </span>
                  </div>
                  
                  <div className="pt-4 border-t mt-4">
                    <h4 className="font-medium text-sm mb-3">Upcoming Due Dates</h4>
                    {upcomingBills
                      .filter(bill => getDaysUntilDue(bill.dueDate) >= 0)
                      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                      .slice(0, 3)
                      .map(bill => (
                        <div key={bill.id} className="flex justify-between items-center mb-2">
                          <span className="text-sm">{bill.name}</span>
                          <span className="text-sm">{formatDate(bill.dueDate)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Bills;
