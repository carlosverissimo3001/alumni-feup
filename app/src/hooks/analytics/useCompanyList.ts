import { useQuery } from "@tanstack/react-query";
import NestAPI from "@/api";
import { CompanyAnalyticsControllerGetCompaniesWithAlumniCountRequest } from "@/sdk";
import { filterApiRequestParams } from "@/utils/query-params";

export const useCompanyList = (params: CompanyAnalyticsControllerGetCompaniesWithAlumniCountRequest) => {
  // No need to send the boolean values if they are false
  const filteredParams = {
    ...filterApiRequestParams(params),
    // this one we actually need to send
    includeTrend: params.includeTrend ?? false,
  };

  return useQuery({
    queryKey: ['company-list', filteredParams],
    queryFn: () => NestAPI.companyAnalyticsControllerGetCompaniesWithAlumniCount(filteredParams),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
};
