import { DateRange } from "react-day-picker";
import { CompaniesAnalyticsControllerGetCompaniesWithAlumniCountRequest } from "@/sdk";

export const handleDateRange = (
  dateRange: DateRange
): Pick<CompaniesAnalyticsControllerGetCompaniesWithAlumniCountRequest, "startDate" | "endDate"> => ({
  startDate: dateRange.from?.toISOString(),
  endDate: dateRange.to?.toISOString()
});
