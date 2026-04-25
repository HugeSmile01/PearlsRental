import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, differenceInDays } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM dd, yyyy');
}

export function calculateRentalDays(startDate: Date, endDate: Date): number {
  return Math.max(1, differenceInDays(endDate, startDate) + 1);
}

export function calculateTotalPrice(pricePerDay: number, startDate: Date, endDate: Date): number {
  const days = calculateRentalDays(startDate, endDate);
  return pricePerDay * days;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'AVAILABLE':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'RESERVED':
    case 'RESERVED_UNPAID':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
    case 'RENTED':
    case 'PICKED_UP_PAID':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'RETURNED':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    case 'OVERDUE':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'CANCELLED':
    case 'EXPIRED':
      return 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500';
    case 'MAINTENANCE':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    AVAILABLE: 'Available',
    RESERVED: 'Reserved',
    RENTED: 'Rented',
    MAINTENANCE: 'Maintenance',
    RESERVED_UNPAID: 'Reserved – Pending Payment',
    PICKED_UP_PAID: 'Picked Up & Paid',
    RETURNED: 'Returned',
    OVERDUE: 'Overdue',
    CANCELLED: 'Cancelled',
    EXPIRED: 'Expired',
  };
  return labels[status] || status;
}

export function parseJsonField<T>(value: string | T): T {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }
  return value;
}
