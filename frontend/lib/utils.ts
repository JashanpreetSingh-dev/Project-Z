import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date for display (converts UTC to local browser time)
 * Assumes input dates are in UTC and converts them to the browser's local timezone
 */
export function formatDate(date: Date | string): string {
  let d: Date;
  if (typeof date === "string") {
    // Parse the date string - if it doesn't have timezone info, treat as UTC
    const dateStr = date.trim();
    // Check if it already has timezone info (Z or +/-offset)
    if (dateStr.endsWith("Z") || dateStr.match(/[+-]\d{2}:\d{2}$/)) {
      d = new Date(dateStr);
    } else {
      // No timezone info - assume UTC and append Z
      d = new Date(dateStr + "Z");
    }
  } else {
    d = date;
  }
  
  // Use Intl.DateTimeFormat to explicitly format in local timezone
  const formatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  return formatter.format(d);
}

/**
 * Format a date with time (converts UTC to local browser time)
 * Assumes input dates are in UTC and converts them to the browser's local timezone
 */
export function formatDateTime(date: Date | string): string {
  let d: Date;
  if (typeof date === "string") {
    // Parse the date string - if it doesn't have timezone info, treat as UTC
    const dateStr = date.trim();
    // Check if it already has timezone info (Z or +/-offset)
    if (dateStr.endsWith("Z") || dateStr.match(/[+-]\d{2}:\d{2}$/)) {
      d = new Date(dateStr);
    } else {
      // No timezone info - assume UTC and append Z
      d = new Date(dateStr + "Z");
    }
  } else {
    d = date;
  }
  
  // Use Intl.DateTimeFormat to explicitly format in local timezone
  const formatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  return formatter.format(d);
}

/**
 * Format duration in seconds to human readable string
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Format phone number for display: +15551234567 -> (555) 123-4567
 */
export function formatPhoneDisplay(phone: string): string {
  if (!phone) return "";

  // Extract only digits
  const digits = phone.replace(/\D/g, "");

  // Handle US/CA numbers (10 or 11 digits)
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  // Return as-is for other formats
  return phone;
}

/**
 * Format phone input as user types: auto-format to (XXX) XXX-XXXX
 */
export function formatPhoneInput(value: string): string {
  // Remove all non-digits
  const digits = value.replace(/\D/g, "");

  // Format based on length
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  // If 11+ digits (with country code)
  if (digits.startsWith("1")) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 11)}`;
  }
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

/**
 * Extract raw digits from formatted phone
 */
export function parsePhoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * Format relative time (e.g., "2 hours ago", "Yesterday", "3 days ago")
 * Returns human-readable relative time string
 */
export function formatRelativeTime(date: Date | string): string {
  let d: Date;
  if (typeof date === "string") {
    const dateStr = date.trim();
    if (dateStr.endsWith("Z") || dateStr.match(/[+-]\d{2}:\d{2}$/)) {
      d = new Date(dateStr);
    } else {
      d = new Date(dateStr + "Z");
    }
  } else {
    d = date;
  }

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return "Just now";
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? "minute" : "minutes"} ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  }
  if (diffDays === 1) {
    return "Yesterday";
  }
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? "month" : "months"} ago`;
  }
  const years = Math.floor(diffDays / 365);
  return `${years} ${years === 1 ? "year" : "years"} ago`;
}
