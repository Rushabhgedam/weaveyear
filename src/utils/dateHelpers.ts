import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay
} from 'date-fns';

/**
 * Get all days in a month with proper week alignment
 */
export const getDaysInMonth = (date: Date, weekStartsOn: 0 | 1 = 0): Date[] => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn });
  
  return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
};

/**
 * Get week number within a month (1-5)
 */
export const getWeekInMonth = (date: Date): number => {
  const monthStart = startOfMonth(date);
  const firstWeekStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const daysDiff = Math.floor((date.getTime() - firstWeekStart.getTime()) / (1000 * 60 * 60 * 24));
  return Math.floor(daysDiff / 7) + 1;
};

/**
 * Format date for display
 */
export const formatDate = (date: Date, formatStr: string = 'yyyy-MM-dd'): string => {
  return format(date, formatStr);
};

/**
 * Check if date is in current month
 */
export const isInMonth = (date: Date, monthDate: Date): boolean => {
  return isSameMonth(date, monthDate);
};

/**
 * Check if two dates are the same day
 */
export const isSameDate = (date1: Date, date2: Date): boolean => {
  return isSameDay(date1, date2);
};

