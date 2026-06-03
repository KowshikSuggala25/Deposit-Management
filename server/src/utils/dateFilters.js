const { endOfDay, endOfMonth, endOfWeek, startOfDay, startOfMonth, startOfWeek } = require("date-fns");

const buildDateRange = ({ range, startDate, endDate }) => {
  const now = new Date();

  if (range === "today") {
    return { start: startOfDay(now), end: endOfDay(now) };
  }

  if (range === "week") {
    return {
      start: startOfWeek(now, { weekStartsOn: 1 }),
      end: endOfWeek(now, { weekStartsOn: 1 }),
    };
  }

  if (range === "month") {
    return { start: startOfMonth(now), end: endOfMonth(now) };
  }

  if (range === "custom" && startDate && endDate) {
    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return null;
    }

    return { start, end };
  }

  return null;
};

module.exports = buildDateRange;
