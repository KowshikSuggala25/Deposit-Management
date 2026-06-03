import { format } from "date-fns";

export const formatDisplayDate = (dateValue) => {
  if (!dateValue) {
    return "-";
  }

  return format(new Date(dateValue), "dd-MMM-yyyy");
};

export const getDateRangePayload = ({ range, customStart, customEnd }) => {
  if (range !== "custom") {
    return {
      range,
    };
  }

  return {
    range,
    startDate: customStart,
    endDate: customEnd,
  };
};
