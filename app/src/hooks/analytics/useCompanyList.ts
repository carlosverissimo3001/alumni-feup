import { useQuery } from "@tanstack/react-query";
import NestAPI from "@/api";
import { CompaniesAnalyticsControllerGetCompaniesWithAlumniCountRequest } from "@/sdk";

const createQueryKey = (params: CompaniesAnalyticsControllerGetCompaniesWithAlumniCountRequest) => {
  return [
    'company-list',
    params.limit,
    params.sortBy,
    params.sortOrder,
    params.offset,
  ];
};

export const useCompanyList = (params: CompaniesAnalyticsControllerGetCompaniesWithAlumniCountRequest) => {
  const { data, isLoading, isError, isSuccess, isFetching, refetch } = useQuery({
    queryKey: createQueryKey(params),
    queryFn: () => NestAPI.companiesAnalyticsControllerGetCompaniesWithAlumniCount(params),
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