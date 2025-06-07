import { DateRange } from "react-day-picker";
import { AnalyticsControllerGetAnalyticsRequest } from "@/sdk";

export const handleDateRange = (
  dateRange: DateRange
): Pick<AnalyticsControllerGetAnalyticsRequest, "startDate" | "endDate"> => ({
  startDate: dateRange.from?.toISOString(),
  endDate: dateRange.to?.toISOString()
});

export const calculateDuration = (startDate: Date, endDate: Date | null) => {
  const end = endDate || new Date();
  const months =
    (end.getFullYear() - startDate.getFullYear()) * 12 +
    end.getMonth() -
    startDate.getMonth();
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${remainingMonths} mo${remainingMonths !== 1 ? "s" : ""}`;
  } else if (remainingMonths === 0) {
    return `${years} yr${years !== 1 ? "s" : ""}`;
  }
  return `${years} yr${years !== 1 ? "s" : ""} ${remainingMonths} mo${
    remainingMonths !== 1 ? "s" : ""
  }`;
};
