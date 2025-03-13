/**
 * Formats a date into a human-readable string with localization support
 * @param date - The date to format (Date object or timestamp)
 * @param options - Formatting options
 * @param options.locale - The locale to use for formatting (default: 'en-US')
 * @param options.dateStyle - The date style to use ('short', 'medium', 'long', 'full')
 * @param options.timeStyle - The time style to use ('short', 'medium', 'long', 'full')
 * @param options.format - Custom format options for Intl.DateTimeFormat
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | number | string = new Date(),
  options?: {
    locale?: string;
    dateStyle?: 'short' | 'medium' | 'long' | 'full';
    timeStyle?: 'short' | 'medium' | 'long' | 'full';
    format?: Intl.DateTimeFormatOptions;
  }
) {
  // Convert input to Date object if it's not already
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Default options
  const {
    locale = 'en-US',
    dateStyle = 'medium',
    timeStyle,
    format = {}
  } = options || {};
  
  // Combine default format with provided format options
  const formatOptions: Intl.DateTimeFormatOptions = {
    ...format
  };
  
  // Add dateStyle if not overridden in custom format
  if (dateStyle && !format.dateStyle) {
    formatOptions.dateStyle = dateStyle;
  }
  
  // Add timeStyle if provided and not overridden in custom format
  if (timeStyle && !format.timeStyle) {
    formatOptions.timeStyle = timeStyle;
  }
  
  try {
    // Use Intl.DateTimeFormat for localized formatting
    const formatter = new Intl.DateTimeFormat(locale, formatOptions);
    return formatter.format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    // Fallback to a basic format if there's an error
    return dateObj.toLocaleDateString();
  }
}