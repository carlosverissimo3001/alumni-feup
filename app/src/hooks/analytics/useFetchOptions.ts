import { useQuery } from "@tanstack/react-query";
import NestAPI from "@/api";
import { AnalyticsControllerGetOptionsRequest as AnalyticsOptionsRequest } from "@/sdk";


export const useFetchOptions = (params: AnalyticsOptionsRequest, enabled: boolean = true) => {
  const { data, isLoading, isError, isSuccess, isFetching, refetch } = useQuery({
    queryKey: ['analytics-options', params],
    queryFn: () => NestAPI.analyticsControllerGetOptions(params),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, 
    gcTime: 10 * 60 * 1000,
    placeholderData: undefined,
    enabled,
  });

  return { data, isLoading, isError, isSuccess, isFetching, refetch };
};
