// backend/utils/dateUtils.js
export const getMonthDateRange = (year, month) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0); // Day 0 of next month is the last day of the current month
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};