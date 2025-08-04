/**
 * Generates the start and end dates for a given month string in 'YYYY-MM' format.
 * @param {string} monthString - The month string, e.g., '2025-08'.
 * @returns {{startDate: string, endDate: string}} The start and end dates in ISO format.
 */
export const getMonthDateRange = (monthString) => {
  const [year, month] = monthString.split('-').map(Number);
  
  if (!year || !month || month < 1 || month > 12) {
    throw new Error("Invalid month string format. Expected 'YYYY-MM'.");
  }

  // Create the start date for the given month
  const startDate = new Date(year, month - 1, 1);
  
  // Create the end date for the given month (by getting the last day)
  const endDate = new Date(year, month, 0); // Day 0 of the next month is the last day of the current month

  // Format dates to YYYY-MM-DD
  const formatDate = (date) => date.toISOString().split('T')[0];

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };
};