
import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import Layout from "@/components/layout/Layout";
import { formatCurrency, calculatePercentage, generateRandomColor } from "@/lib/utils";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import ProgressBar from "@/components/dashboard/ProgressBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  targetAmount: z.coerce.number().min(1, "Target amount must be greater than 0"),
  currentAmount: z.coerce.number().min(0, "Current amount cannot be negative"),
  targetDate: z.date().optional(),
});

type FormData = z.infer<typeof formSchema>;

const fundFormSchema = z.object({
  accountId: z.string().min(1, "Please select an account"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
});

type FundFormData = z.infer<typeof fundFormSchema>;

const Goals = () => {
  const { savingsGoals, addSavingsGoal, updateSavingsGoal, accounts, fundSavingsGoal } = useData();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isFundDialogOpen, setIsFundDialogOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      targetAmount: 0,
      currentAmount: 0,
      targetDate: undefined,
    },
  });

  const fundForm = useForm<FundFormData>({
    resolver: zodResolver(fundFormSchema),
    defaultValues: {
      accountId: "",
      amount: 0,
    },
  });

  const onSubmit = async (data: FormData) => {
    const success = await addSavingsGoal({
      name: data.name,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount,
      targetDate: data.targetDate,
      color: generateRandomColor(),
    });

    if (success) {
      form.reset();
      setIsAddDialogOpen(false);
    }
  };

  const handleAddFunds = async (data: FundFormData) => {
    if (selectedGoalId) {
      const success = await fundSavingsGoal(selectedGoalId, data.accountId, data.amount);
      
      if (success) {
        fundForm.reset();
        setIsFundDialogOpen(false);
        setSelectedGoalId(null);
      }
    }
  };

  const openFundDialog = (goalId: string) => {
    setSelectedGoalId(goalId);
    
    // Reset form and set default account if available
    fundForm.reset({
      accountId: accounts.length > 0 ? accounts[0].id : "",
      amount: 0,
    });
    
    setIsFundDialogOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Savings Goals</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-moneyxPrimary hover:bg-moneyxPrimary/90">
                <Plus className="mr-2 h-4 w-4" /> Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Savings Goal</DialogTitle>
                <DialogDescription>
                  Set up a new savings target for your future plans
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
                        <FormLabel>Goal Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Vacation, Emergency Fund, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="targetAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Amount (₹)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="0.00" 
                              type="number" 
                              min="0" 
                              step="0.01"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currentAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Amount (₹)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="0.00" 
                              type="number" 
                              min="0" 
                              step="0.01"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="targetDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Target Date (Optional)</FormLabel>
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
                              disabled={(date) => date < new Date()}
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
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
                      Create Goal
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savingsGoals.map((goal) => {
            const percentage = calculatePercentage(goal.currentAmount, goal.targetAmount);
            const remaining = goal.targetAmount - goal.currentAmount;
            const color = goal.color || "bg-moneyxPrimary";
            
            return (
              <div
                key={goal.id}
                className="bg-white p-6 rounded-lg border shadow-sm"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: goal.color }}
                  />
                  <h2 className="text-xl font-bold">{goal.name}</h2>
                </div>

                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-1">Progress</div>
                  <ProgressBar
                    current={goal.currentAmount}
                    max={goal.targetAmount}
                    color={color}
                    showAmount={false}
                  />
                  <div className="text-right text-sm mt-1">{percentage}%</div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-500">Saved</div>
                    <div className="font-bold">{formatCurrency(goal.currentAmount)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Target</div>
                    <div className="font-bold">{formatCurrency(goal.targetAmount)}</div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-sm text-gray-500">
                    {formatCurrency(remaining)} left to save
                  </div>
                  {goal.targetDate && (
                    <div className="text-sm text-gray-500">
                      Target date: {format(goal.targetDate, "MMM d, yyyy")}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline">Edit</Button>
                  <Button 
                    className="bg-moneyxPrimary hover:bg-moneyxPrimary/90"
                    onClick={() => openFundDialog(goal.id)}
                  >
                    Add Funds
                  </Button>
                </div>
              </div>
            );
          })}

          {/* Create New Goal Card */}
          <div className="bg-white p-6 rounded-lg border shadow-sm border-dashed flex flex-col items-center justify-center text-center min-h-[280px]">
            <div className="mb-4 p-4 bg-gray-50 rounded-full">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Create New Goal</h3>
            <p className="text-gray-500 mb-4">
              Set up a new savings target for your future plans
            </p>
            <Button 
              variant="outline"
              onClick={() => setIsAddDialogOpen(true)}
            >
              Add Goal
            </Button>
          </div>
        </div>
      </div>

      {/* Add Funds Dialog */}
      <Dialog open={isFundDialogOpen} onOpenChange={setIsFundDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Funds to Goal</DialogTitle>
            <DialogDescription>
              Select the account and amount you want to add to your savings goal.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...fundForm}>
            <form onSubmit={fundForm.handleSubmit(handleAddFunds)} className="space-y-4">
              <FormField
                control={fundForm.control}
                name="accountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source Account</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
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
              
              <FormField
                control={fundForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="0.00"
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
                  onClick={() => setIsFundDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-moneyxPrimary hover:bg-moneyxPrimary/90"
                >
                  Add Funds
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Goals;
