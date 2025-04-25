import { useQuery } from "@tanstack/react-query";
import NestAPI from "@/api";
import { CompaniesAnalyticsControllerGetCompaniesWithAlumniCountRequest } from "@/sdk";
import { filterApiRequestParams } from "@/utils/query-params";

export const useCompanyList = (params: CompaniesAnalyticsControllerGetCompaniesWithAlumniCountRequest) => {
  // No need to send the boolean values if they are false
  const filteredParams = filterApiRequestParams(params);

  return useQuery({
    queryKey: ['company-list', filteredParams],
    queryFn: () => NestAPI.companiesAnalyticsControllerGetCompaniesWithAlumniCount(filteredParams),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};