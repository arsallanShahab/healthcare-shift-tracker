import {
  differenceInMinutes,
  endOfWeek,
  format,
  formatDistanceToNow,
  startOfWeek,
} from "date-fns";

/**
 * Format a date for display
 * @param date The date to format
 * @param formatString The format string (default: 'PPp')
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, formatString = "PPp"): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, formatString);
}

/**
 * Format time for display (HH:mm)
 * @param date The date to format
 * @returns Formatted time string
 */
export function formatTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "HH:mm");
}

/**
 * Format date for display (dd/MM/yyyy)
 * @param date The date to format
 * @returns Formatted date string
 */
export function formatDateShort(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "dd/MM/yyyy");
}

/**
 * Get relative time (e.g., "2 hours ago")
 * @param date The date to compare
 * @returns Relative time string
 */
export function getRelativeTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Calculate duration between two dates in minutes
 * @param startDate Start date
 * @param endDate End date (default: now)
 * @returns Duration in minutes
 */
export function calculateDuration(
  startDate: Date | string,
  endDate?: Date | string
): number {
  const startDateObj =
    typeof startDate === "string" ? new Date(startDate) : startDate;
  const endDateObj = endDate
    ? typeof endDate === "string"
      ? new Date(endDate)
      : endDate
    : new Date();

  return differenceInMinutes(endDateObj, startDateObj);
}

/**
 * Format duration in minutes to hours and minutes
 * @param minutes Duration in minutes
 * @returns Formatted duration string (e.g., "2h 30m")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 0) return "0m";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Get the start and end of the current week
 * @param date Reference date (default: today)
 * @returns Object with start and end dates
 */
export function getWeekBounds(date = new Date()) {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  };
}

/**
 * Check if a date is today
 * @param date The date to check
 * @returns Whether the date is today
 */
export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const today = new Date();

  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

/**
 * Convert minutes to decimal hours
 * @param minutes Duration in minutes
 * @returns Duration in decimal hours
 */
export function minutesToHours(minutes: number): number {
  return Number((minutes / 60).toFixed(2));
}
