// Shared date formatting utility to format UTC dates to IST (Asia/Kolkata) timezone consistently.

/**
 * Formats a date into a clean string in Asia/Kolkata (IST) timezone using custom formatting options.
 */
export function formatScreeningDate(
  dateInput: Date | string | number,
  options: Intl.DateTimeFormatOptions = {}
): string {
  if (!dateInput) return "TBD";
  try {
    const date = typeof dateInput === "string" || typeof dateInput === "number" ? new Date(dateInput) : dateInput;
    
    // Check for invalid date
    if (isNaN(date.getTime())) return "TBD";

    const defaultOptions: Intl.DateTimeFormatOptions = {
      timeZone: "Asia/Kolkata",
      ...options
    };
    
    return new Intl.DateTimeFormat("en-IN", defaultOptions)
      .format(date)
      .replace("am", "AM")
      .replace("pm", "PM");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "TBD";
  }
}

/**
 * Returns the short date string, e.g. "Wed, 15 Jul" or "15 Jul"
 */
export function formatShortDate(dateInput: Date | string | number, includeWeekday: boolean = true): string {
  return formatScreeningDate(dateInput, {
    weekday: includeWeekday ? "short" : undefined,
    day: "numeric",
    month: "short"
  });
}

/**
 * Returns the short time string, e.g. "12:30 AM"
 */
export function formatShortTime(dateInput: Date | string | number): string {
  return formatScreeningDate(dateInput, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

/**
 * Returns the combined date and time in IST, e.g. "Wed, 15 Jul, 12:30 AM"
 */
export function formatFullDateTime(dateInput: Date | string | number): string {
  return `${formatShortDate(dateInput)}, ${formatShortTime(dateInput)}`;
}

/**
 * Returns date as "15 Jul 2026, 12:30 AM"
 */
export function formatLongDateTime(dateInput: Date | string | number): string {
  return formatScreeningDate(dateInput, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}
