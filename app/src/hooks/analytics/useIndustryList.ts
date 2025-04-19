import { useQuery } from "@tanstack/react-query";
import NestAPI from "@/api";
import { CompaniesAnalyticsControllerGetIndustryWithCountsRequest } from "@/sdk";

const createQueryKey = (params: CompaniesAnalyticsControllerGetIndustryWithCountsRequest) => {
  return [
    'industry-list',
    params.limit,
    params.sortBy,
    params.sortOrder,
    params.offset,
  ];
};

export const useIndustryList = (params: CompaniesAnalyticsControllerGetIndustryWithCountsRequest) => {
  const { data, isLoading, isError, isSuccess, isFetching, refetch } = useQuery({
    queryKey: createQueryKey(params),
    queryFn: () => NestAPI.companiesAnalyticsControllerGetIndustryWithCounts(params),
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
