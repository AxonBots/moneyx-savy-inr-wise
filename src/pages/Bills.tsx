
import React, { useState } from "react";
import { format } from "date-fns";
import { useData } from "@/contexts/DataContext";
import { formatCurrency } from "@/lib/utils";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarClock, Check, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Bill } from "@/types";

const Bills = () => {
  const { bills, updateBill, deleteBill } = useData();
  const [activeTab, setActiveTab] = useState<string>("upcoming");
  
  // Separate bills into upcoming and paid
  const upcomingBills = bills.filter(bill => !bill.isPaid);
  const paidBills = bills.filter(bill => bill.isPaid);
  
  // Sort upcoming bills by due date (closest first)
  const sortedUpcomingBills = [...upcomingBills].sort(
    (a, b) => a.dueDate.getTime() - b.dueDate.getTime()
  );
  
  // Sort paid bills by due date (most recent first)
  const sortedPaidBills = [...paidBills].sort(
    (a, b) => b.dueDate.getTime() - a.dueDate.getTime()
  );
  
  const markAsPaid = async (bill: Bill) => {
    await updateBill(bill.id, { isPaid: true });
  };
  
  const markAsUnpaid = async (bill: Bill) => {
    await updateBill(bill.id, { isPaid: false });
  };
  
  const handleDeleteBill = async (id: string) => {
    await deleteBill(id);
  };
  
  const calculateDaysUntilDue = (dueDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  const renderDueDate = (bill: Bill) => {
    const daysUntilDue = calculateDaysUntilDue(bill.dueDate);
    
    if (daysUntilDue === 0) {
      return <span className="text-red-500 font-medium">Due today</span>;
    } else if (daysUntilDue < 0) {
      return <span className="text-red-500 font-medium">Overdue by {Math.abs(daysUntilDue)} days</span>;
    } else if (daysUntilDue === 1) {
      return <span className="text-amber-500 font-medium">Due tomorrow</span>;
    } else if (daysUntilDue <= 3) {
      return <span className="text-amber-500 font-medium">Due in {daysUntilDue} days</span>;
    } else {
      return <span className="text-gray-500">Due in {daysUntilDue} days</span>;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Bills</h1>
          
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            <span>Add Bill</span>
          </Button>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Manage Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="upcoming">
                  Upcoming
                  {upcomingBills.length > 0 && (
                    <span className="ml-2 bg-moneyxPrimary text-white text-xs py-0.5 px-2 rounded-full">
                      {upcomingBills.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upcoming">
                {sortedUpcomingBills.length > 0 ? (
                  <div className="divide-y">
                    {sortedUpcomingBills.map((bill) => (
                      <div key={bill.id} className="py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-gray-100 rounded-full">
                            <CalendarClock className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{bill.name}</h3>
                            <div className="flex items-center gap-2 text-sm">
                              {renderDueDate(bill)}
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-500">{format(bill.dueDate, 'MMM dd, yyyy')}</span>
                              {bill.isRecurring && (
                                <>
                                  <span className="text-gray-400">•</span>
                                  <span className="text-gray-500">Recurring</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-red-600">{formatCurrency(bill.amount)}</span>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => markAsPaid(bill)}
                          >
                            <Check className="mr-1 h-4 w-4" />
                            <span>Mark Paid</span>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-gray-500"
                            onClick={() => handleDeleteBill(bill.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <p>No upcoming bills</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="paid">
                {sortedPaidBills.length > 0 ? (
                  <div className="divide-y">
                    {sortedPaidBills.map((bill) => (
                      <div key={bill.id} className="py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-green-100 rounded-full">
                            <Check className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{bill.name}</h3>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-green-600">Paid</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-500">{format(bill.dueDate, 'MMM dd, yyyy')}</span>
                              {bill.isRecurring && (
                                <>
                                  <span className="text-gray-400">•</span>
                                  <span className="text-gray-500">Recurring</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{formatCurrency(bill.amount)}</span>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => markAsUnpaid(bill)}
                          >
                            <span>Mark Unpaid</span>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-gray-500"
                            onClick={() => handleDeleteBill(bill.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <p>No paid bills</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Bills;
