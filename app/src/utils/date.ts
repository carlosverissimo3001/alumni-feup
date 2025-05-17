import { DateRange } from "react-day-picker";
import { CompanyAnalyticsControllerGetCompaniesWithAlumniCountRequest } from "@/sdk";

export const handleDateRange = (
  dateRange: DateRange
): Pick<CompanyAnalyticsControllerGetCompaniesWithAlumniCountRequest, "startDate" | "endDate"> => ({
  startDate: dateRange.from?.toISOString(),
  endDate: dateRange.to?.toISOString()
});
