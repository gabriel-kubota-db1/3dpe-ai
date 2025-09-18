/**
 * Utility functions for datetime formatting
 */

/**
 * Converts a Date object to MySQL-compatible datetime string
 * Format: YYYY-MM-DD HH:mm:ss
 */
export const toMySQLDateTime = (date: Date = new Date()): string => {
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

/**
 * Gets current timestamp in MySQL format
 */
export const getCurrentMySQLDateTime = (): string => {
  return toMySQLDateTime(new Date());
};
