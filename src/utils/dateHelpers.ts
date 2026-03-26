import { format, differenceInDays, addDays, isAfter, isBefore, isToday, parseISO } from 'date-fns';

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMM dd, yyyy');
  } catch {
    return dateStr;
  }
}

export function formatDateShort(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMM dd');
  } catch {
    return dateStr;
  }
}

export function daysUntil(dateStr: string): number {
  return differenceInDays(parseISO(dateStr), new Date());
}

export function isOverdue(dateStr: string): boolean {
  return isBefore(parseISO(dateStr), new Date()) && !isToday(parseISO(dateStr));
}

export function isDueSoon(dateStr: string, daysThreshold: number = 7): boolean {
  const date = parseISO(dateStr);
  const now = new Date();
  return isAfter(date, now) && differenceInDays(date, now) <= daysThreshold;
}

export function getUrgencyColor(dateStr: string): string {
  if (isOverdue(dateStr)) return 'danger';
  if (isDueSoon(dateStr, 7)) return 'warning';
  return 'success';
}

export function getDaysRemaining(dateStr: string): string {
  const days = daysUntil(dateStr);
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Due today';
  return `${days}d left`;
}

export function getDateRange(startStr: string, endStr: string): string {
  return `${formatDateShort(startStr)} — ${formatDateShort(endStr)}`;
}

export { format, differenceInDays, addDays, isAfter, isBefore, isToday, parseISO };
