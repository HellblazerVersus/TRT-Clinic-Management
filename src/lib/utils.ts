import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, differenceInDays } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—';
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '—';
  return format(new Date(date), 'MMM d, yyyy h:mm a');
}

export type AlertLevel = 'overdue' | 'warning' | 'ok' | 'none';

export function getDateAlertLevel(date: Date | string | null | undefined): AlertLevel {
  if (!date) return 'none';
  const days = differenceInDays(new Date(date), new Date());
  if (days < 0) return 'overdue';
  if (days <= 3) return 'warning';
  return 'ok';
}

export function daysFromNow(date: Date | string | null | undefined): string {
  if (!date) return '—';
  const days = differenceInDays(new Date(date), new Date());
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days}d`;
}

// Badge helpers kept for API compatibility — new design uses inline classes
export function getSubscriptionBadgeColor(status: string): string {
  const map: Record<string, string> = {
    ACTIVE:   'bg-teal-500/10 text-teal-400 border border-teal-500/20',
    TRIALING: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
    PAST_DUE: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    CANCELED: 'bg-gray-700/30 text-gray-500 border border-gray-700/30',
    UNPAID:   'bg-red-500/10 text-red-400 border border-red-500/20',
    NONE:     'bg-gray-700/20 text-gray-600 border border-gray-700/20',
  };
  return map[status] ?? map.NONE;
}

export function getProtocolStatusColor(status: string): string {
  const map: Record<string, string> = {
    ACTIVE:       'bg-teal-500/10 text-teal-400 border border-teal-500/20',
    PAUSED:       'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    DISCONTINUED: 'bg-gray-700/30 text-gray-500 border border-gray-700/20',
  };
  return map[status] ?? '';
}

export function getRenewalStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING:   'bg-sky-500/10 text-sky-400 border border-sky-500/20',
    DISPENSED: 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
    OVERDUE:   'bg-red-500/10 text-red-400 border border-red-500/20',
    CANCELED:  'bg-gray-700/30 text-gray-500 border border-gray-700/20',
  };
  return map[status] ?? '';
}

export function compoundDisplayName(compound: string): string {
  const map: Record<string, string> = {
    testosterone_cypionate: 'Test. Cypionate',
    testosterone_enanthate: 'Test. Enanthate',
    sermorelin: 'Sermorelin',
    pt141: 'PT-141',
    anastrozole: 'Anastrozole',
    hcg: 'HCG',
  };
  return map[compound] ?? compound;
}
