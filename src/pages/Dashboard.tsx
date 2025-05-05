
import React, { useState, useEffect } from "react";
import { useData } from "@/contexts/DataContext";
import { formatCurrency } from "@/lib/utils";
import Layout from "@/components/layout/Layout";
import StatCard from "@/components/dashboard/StatCard";
import TransactionList from "@/components/dashboard/TransactionList";
import InsightCard from "@/components/dashboard/InsightCard";
import BillsList from "@/components/dashboard/BillsList";
import AccountsList from "@/components/dashboard/AccountsList";
import GoalsList from "@/components/dashboard/GoalsList";
import ProgressBar from "@/components/dashboard/ProgressBar";

const Dashboard = () => {
  const { 
    accounts,
    transactions,
    categories,
    bills,
    savingsGoals,
    budgets,
    notifications,
    calculateTotalBalance,
    calculateNetIncome
  } = useData();

  // State for previous month data
  const [previousMonthIncome, setPreviousMonthIncome] = useState(0);
  const [previousMonthExpenses, setPreviousMonthExpenses] = useState(0);
  const [previousMonthNet, setPreviousMonthNet] = useState(0);

  // Calculate monthly income, expenses, and net income
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get previous month and year
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const monthTransactions = transactions.filter(
    (t) => t.date.getMonth() === currentMonth && t.date.getFullYear() === currentYear
  );

  const prevMonthTransactions = transactions.filter(
    (t) => t.date.getMonth() === prevMonth && t.date.getFullYear() === prevYear
  );

  // Calculate current month figures
  const monthlyIncome = monthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = monthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const netIncome = monthlyIncome - monthlyExpenses;

  // Calculate previous month figures
  useEffect(() => {
    const prevIncome = prevMonthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const prevExpenses = prevMonthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    setPreviousMonthIncome(prevIncome);
    setPreviousMonthExpenses(prevExpenses);
    setPreviousMonthNet(prevIncome - prevExpenses);
  }, [prevMonthTransactions]);

  // Calculate percentage changes
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) {
      return current > 0 ? "New" : "0.0";
    }
    
    const percentChange = ((current - previous) / Math.abs(previous)) * 100;
    
    // Handle edge cases like going from negative to positive
    if (!isFinite(percentChange)) {
      return "N/A";
    }
    
    // Limit to one decimal place
    return percentChange.toFixed(1);
  };

  // Calculate spending by category
  const expensesByCategory = monthTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc: Record<string, number>, transaction) => {
      const categoryId = transaction.category.id;
      if (!acc[categoryId]) {
        acc[categoryId] = 0;
      }
      acc[categoryId] += Math.abs(transaction.amount);
      return acc;
    }, {});

  const topSpendingCategories = Object.entries(expensesByCategory)
    .map(([categoryId, amount]) => {
      const category = categories.find((c) => c.id === categoryId);
      return {
        name: category ? category.name : "Other",
        value: amount,
        color: category ? category.color : "#CBD5E1",
        percentage: monthlyExpenses > 0 ? ((amount / monthlyExpenses) * 100).toFixed(1) + "%" : "0%",
      };
    })
    .sort((a, b) => b.value - a.value);

  // Get the current budget
  const currentBudget = budgets.find(
    (b) => b.month === currentMonth + 1 && b.year === currentYear
  );

  // Generate AI insights based on actual data
  const generatedInsights = [
    {
      type: "alert",
      title: "Bill reminders",
      description: `You have ${bills.filter(b => !b.isPaid).length} bills due in the next 7 days totaling ${formatCurrency(
        bills
          .filter(b => !b.isPaid)
          .filter(b => {
            const daysUntil = Math.ceil((new Date(b.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            return daysUntil <= 7;
          })
          .reduce((sum, bill) => sum + bill.amount, 0)
      )}.`
    },
    {
      type: "insight",
      title: "Top spending category",
      description: topSpendingCategories.length > 0 
        ? `Your top spending category this month is ${topSpendingCategories[0].name} at ${formatCurrency(topSpendingCategories[0].value)} (${topSpendingCategories[0].percentage} of total expenses).`
        : "Add transactions to see insights about your top spending categories."
    },
    {
      type: "insight",
      title: "Savings progress",
      description: savingsGoals.length > 0
        ? `You're ${Math.round((savingsGoals[0].currentAmount / savingsGoals[0].targetAmount) * 100)}% toward your ${savingsGoals[0].name} goal.`
        : "Set up a savings goal to track your progress."
    }
  ];

  // Compare current month spending with previous month
  if (previousMonthExpenses > 0 && monthlyExpenses > previousMonthExpenses) {
    const increasePercent = ((monthlyExpenses - previousMonthExpenses) / previousMonthExpenses * 100).toFixed(0);
    generatedInsights.push({
      type: "alert",
      title: "Spending increased",
      description: `Your spending has increased by ${increasePercent}% compared to last month. Consider reviewing your budget.`
    });
  }

  // Add budget warning if over budget
  if (currentBudget && currentBudget.totalSpent > currentBudget.totalAllocated) {
    generatedInsights.push({
      type: "alert",
      title: "Budget warning",
      description: `You've exceeded your monthly budget by ${formatCurrency(currentBudget.totalSpent - currentBudget.totalAllocated)}.`
    });
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Monthly Income"
            value={formatCurrency(monthlyIncome)}
            trend={{ 
              value: calculatePercentageChange(monthlyIncome, previousMonthIncome), 
              positive: monthlyIncome >= previousMonthIncome 
            }}
          />
          <StatCard
            title="Monthly Expenses"
            value={formatCurrency(monthlyExpenses)}
            trend={{ 
              value: calculatePercentageChange(monthlyExpenses, previousMonthExpenses), 
              positive: monthlyExpenses <= previousMonthExpenses 
            }}
          />
          <StatCard
            title="Net Income"
            value={formatCurrency(netIncome)}
            trend={{ 
              value: calculatePercentageChange(netIncome, previousMonthNet), 
              positive: netIncome >= previousMonthNet 
            }}
          />
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Spending by Category */}
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Spending by Category</h2>
              <div className="flex flex-col md:flex-row items-center">
                <div className="w-full md:w-1/2">
                  <div className="aspect-square max-w-[250px] mx-auto">
                    <div className="rounded-full bg-gray-100 p-8 aspect-square relative">
                      {topSpendingCategories.map((category, index) => {
                        const percentage = parseFloat(category.percentage);
                        const size = 140;
                        const strokeWidth = 30;
                        const radius = (size - strokeWidth) / 2;
                        const circumference = 2 * Math.PI * radius;
                        
                        // Calculate the dash offset for each category
                        let totalPercentage = 0;
                        for (let i = 0; i < index; i++) {
                          totalPercentage += parseFloat(topSpendingCategories[i].percentage);
                        }
                        
                        const dashArray = (percentage / 100) * circumference;
                        const dashOffset = ((100 - totalPercentage - percentage) / 100) * circumference;
                        
                        return (
                          <svg 
                            key={index}
                            className="absolute inset-0"
                            width="100%" 
                            height="100%" 
                            viewBox={`0 0 ${size} ${size}`}
                          >
                            <circle
                              cx={size / 2}
                              cy={size / 2}
                              r={radius}
                              strokeWidth={strokeWidth}
                              stroke={category.color}
                              fill="none"
                              strokeDasharray={`${dashArray} ${circumference - dashArray}`}
                              strokeDashoffset={dashOffset}
                              transform={`rotate(-90 ${size / 2} ${size / 2})`}
                            />
                          </svg>
                        );
                      })}
                      
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-xs text-gray-500">Total</div>
                        <div className="text-lg font-bold">{formatCurrency(monthlyExpenses)}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-1/2 mt-6 md:mt-0 space-y-2">
                  {topSpendingCategories.slice(0, 5).map((category, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }} 
                        />
                        <span>{category.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{formatCurrency(category.value)}</span>
                        <span className="text-xs text-gray-500">({category.percentage})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">AI Insights</h2>
              <div className="space-y-4">
                {generatedInsights.map((insight, index) => (
                  <InsightCard
                    key={index}
                    type={insight.type === "alert" ? "alert" : "insight"}
                    title={insight.title}
                    description={insight.description}
                  />
                ))}
              </div>
            </div>
            
            {/* Recent Transactions */}
            <TransactionList 
              transactions={transactions} 
              title="Recent Transactions" 
              showViewAll={true} 
            />
            
            {/* Budget Progress */}
            {currentBudget && (
              <div className="bg-white rounded-lg border shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Budget Progress</h2>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="font-medium">Overall Budget</span>
                      <span>{formatCurrency(currentBudget.totalSpent)} of {formatCurrency(currentBudget.totalAllocated)}</span>
                    </div>
                    <ProgressBar
                      current={currentBudget.totalSpent}
                      max={currentBudget.totalAllocated}
                      color="bg-moneyxPrimary"
                      showAmount={false}
                    />
                    <div className="text-xs text-right text-gray-500 mt-1">
                      {Math.round((currentBudget.totalSpent / currentBudget.totalAllocated) * 100)}% used
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Top Categories</h3>
                    {currentBudget.categories.map((budgetCategory) => {
                      const category = categories.find(c => c.id === budgetCategory.categoryId);
                      if (!category) return null;
                      
                      const percentage = Math.min(100, Math.round((budgetCategory.spent / budgetCategory.allocated) * 100));
                      
                      return (
                        <div key={budgetCategory.categoryId} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{category.name}</span>
                            <span>
                              {formatCurrency(budgetCategory.spent)} of {formatCurrency(budgetCategory.allocated)}
                            </span>
                          </div>
                          <div className="h-2 w-full bg-gray-200 rounded-full">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: percentage >= 100 ? "#ef4444" : 
                                  percentage >= 80 ? "#f97316" : 
                                  category.color
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Right column */}
          <div className="space-y-6">
            <AccountsList 
              accounts={accounts}
              title="Accounts"
              showViewAll={true}
            />
            
            <BillsList 
              bills={bills} 
              title="Upcoming Bills"
              showViewAll={true}
            />
            
            <GoalsList 
              goals={savingsGoals}
              title="Savings Goals"
              showViewAll={true}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
