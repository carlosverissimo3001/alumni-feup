import { useQuery } from "@tanstack/react-query";
import NestAPI from "@/api";
import { CompaniesAnalyticsControllerGetIndustryWithCountsRequest } from "@/sdk";
import { filterApiRequestParams } from "@/utils/query-params";


export const useIndustryList = (params: CompaniesAnalyticsControllerGetIndustryWithCountsRequest) => {
  const filteredParams = filterApiRequestParams(params);
  const { data, isLoading, isError, isSuccess, isFetching, refetch } = useQuery({
    queryKey: ['industry-list', filteredParams],
    queryFn: () => NestAPI.companiesAnalyticsControllerGetIndustryWithCounts(filteredParams),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, 
    gcTime: 10 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  return {
    data,
    isLoading,
    isError,
    isSuccess,
    isFetching,
    refetch,
  };
};
