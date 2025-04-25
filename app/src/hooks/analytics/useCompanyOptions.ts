import { useQuery } from "@tanstack/react-query";
import NestAPI from "@/api";
import { CompaniesAnalyticsControllerGetCompanyOptionsRequest } from "@/sdk";

const createQueryKey = (params: CompaniesAnalyticsControllerGetCompanyOptionsRequest) => {
  return [
    'company-options',
    params.limit,
    params.sortBy,
    params.sortOrder,
    params.offset,
    params.companySearch,
  ];
};

export const useCompanyOptions = (params: CompaniesAnalyticsControllerGetCompanyOptionsRequest) => {
  const companySearch = params.companySearch ?? ""; // Handle undefined
  const { data, isLoading, isError, isSuccess, isFetching, refetch } = useQuery({
    queryKey: createQueryKey({ ...params, companySearch }),
    queryFn: () => NestAPI.companiesAnalyticsControllerGetCompanyOptions({ ...params, companySearch }),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, 
    gcTime: 10 * 60 * 1000,
    enabled: !!companySearch && companySearch.length >= 3,
    placeholderData: undefined,
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