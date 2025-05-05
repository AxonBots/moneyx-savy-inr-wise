
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = "INR"): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(number: number): string {
  return new Intl.NumberFormat('en-IN').format(number);
}

export function formatDate(date: Date, dateFormat: string = "MM/dd/yyyy"): string {
  return format(date, dateFormat);
}

export function calculatePercentage(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
}

export function getRelativeDateLabel(date: Date): string {
  const now = new Date();
  const diffTime = Math.abs(date.getTime() - now.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return date > now ? "Tomorrow" : "Yesterday";
  } else {
    return `in ${diffDays} days`;
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function generateRandomColor(): string {
  const colors = [
    "#ef4444", "#f97316", "#f59e0b", "#eab308", 
    "#84cc16", "#22c55e", "#10b981", "#14b8a6", 
    "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1", 
    "#8b5cf6", "#a855f7", "#d946ef", "#ec4899"
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
