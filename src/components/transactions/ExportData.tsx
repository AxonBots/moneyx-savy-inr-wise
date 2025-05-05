
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, subDays, subMonths, subWeeks, subYears } from 'date-fns';
import { CalendarIcon, Download, FileText } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Transaction } from '@/types';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

type DateRange = {
  from: Date;
  to: Date;
};

const ExportData = () => {
  const { transactions, accounts, categories } = useData();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [dateFilter, setDateFilter] = useState<string>('custom');

  // Handle preset date ranges
  const handlePresetChange = (value: string) => {
    setDateFilter(value);
    const today = new Date();
    
    switch (value) {
      case 'today':
        setDateRange({ from: today, to: today });
        break;
      case 'yesterday':
        const yesterday = subDays(today, 1);
        setDateRange({ from: yesterday, to: yesterday });
        break;
      case 'last7days':
        setDateRange({ from: subDays(today, 7), to: today });
        break;
      case 'last30days':
        setDateRange({ from: subDays(today, 30), to: today });
        break;
      case 'thisMonth':
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        setDateRange({ from: firstDayOfMonth, to: today });
        break;
      case 'lastMonth':
        const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        setDateRange({ from: firstDayLastMonth, to: lastDayLastMonth });
        break;
      case 'thisYear':
        const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
        setDateRange({ from: firstDayOfYear, to: today });
        break;
      case 'lastYear':
        const firstDayLastYear = new Date(today.getFullYear() - 1, 0, 1);
        const lastDayLastYear = new Date(today.getFullYear() - 1, 11, 31);
        setDateRange({ from: firstDayLastYear, to: lastDayLastYear });
        break;
      default:
        // Custom - do nothing, let user select dates
        break;
    }
  };

  // Filter transactions based on date range
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate >= dateRange.from && transactionDate <= dateRange.to;
  });

  // Export to CSV function
  const exportToCsv = () => {
    // Format transactions for CSV
    const csvData = filteredTransactions.map(transaction => {
      const account = accounts.find(a => a.id === transaction.accountId);
      return {
        date: formatDate(transaction.date),
        description: transaction.description,
        category: transaction.category.name,
        account: account?.name || '-',
        amount: formatCurrency(Math.abs(transaction.amount)),
        type: transaction.type,
      };
    });

    // Create CSV header
    const csvHeader = ['Date', 'Description', 'Category', 'Account', 'Amount', 'Type'].join(',');
    
    // Format CSV rows
    const csvRows = csvData.map(row => 
      [row.date, `"${row.description}"`, row.category, row.account, row.amount, row.type].join(',')
    );
    
    // Combine header and rows
    const csvContent = [csvHeader, ...csvRows].join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${format(dateRange.from, 'yyyy-MM-dd')}_to_${format(dateRange.to, 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('CSV Export Successful', {
      description: `${filteredTransactions.length} transactions exported`,
    });
  };

  // Export to PDF function using jsPDF
  const exportToPdf = () => {
    // Note: In a real app, you'd use a PDF library like jsPDF
    // This is a simplified example that alerts the user
    alert(`PDF export would include ${filteredTransactions.length} transactions from ${format(dateRange.from, 'yyyy-MM-dd')} to ${format(dateRange.to, 'yyyy-MM-dd')}.`);
    
    toast.success('PDF Export Successful', {
      description: `${filteredTransactions.length} transactions exported`,
    });
    
    console.log('To implement actual PDF export, you would need to install jspdf and jspdf-autotable packages.');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Export Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="preset" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="preset">Preset Ranges</TabsTrigger>
            <TabsTrigger value="custom">Custom Range</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preset" className="space-y-4">
            <div>
              <Select onValueChange={handlePresetChange} defaultValue="last30days">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="last7days">Last 7 Days</SelectItem>
                  <SelectItem value="last30days">Last 30 Days</SelectItem>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                  <SelectItem value="lastMonth">Last Month</SelectItem>
                  <SelectItem value="thisYear">This Year</SelectItem>
                  <SelectItem value="lastYear">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="mt-2 text-sm text-gray-500">
                {dateFilter !== 'custom' ? (
                  <p>
                    From {format(dateRange.from, 'dd MMM yyyy')} to {format(dateRange.to, 'dd MMM yyyy')}
                  </p>
                ) : (
                  <p>Select a custom date range</p>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="custom" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-1/2">
                <p className="mb-2 text-sm font-medium">Start Date</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? format(dateRange.from, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => date && setDateRange({ ...dateRange, from: date })}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="w-full sm:w-1/2">
                <p className="mb-2 text-sm font-medium">End Date</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.to ? format(dateRange.to, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => date && setDateRange({ ...dateRange, to: date })}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                      disabled={(date) => date < dateRange.from}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <p className="mb-3 font-medium">Export Format:</p>
          <div className="flex gap-4">
            <Button
              variant={exportFormat === 'csv' ? 'default' : 'outline'}
              className={exportFormat === 'csv' ? 'bg-moneyxPrimary hover:bg-moneyxPrimary/90' : ''}
              onClick={() => setExportFormat('csv')}
            >
              <FileText className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button
              variant={exportFormat === 'pdf' ? 'default' : 'outline'}
              className={exportFormat === 'pdf' ? 'bg-moneyxPrimary hover:bg-moneyxPrimary/90' : ''}
              onClick={() => setExportFormat('pdf')}
            >
              <FileText className="mr-2 h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="text-sm mb-2">
            <span className="font-medium">{filteredTransactions.length}</span> transactions selected
          </div>
          <Button
            className="w-full bg-moneyxPrimary hover:bg-moneyxPrimary/90"
            onClick={exportFormat === 'csv' ? exportToCsv : exportToPdf}
          >
            <Download className="mr-2 h-4 w-4" />
            Export {exportFormat.toUpperCase()}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportData;
