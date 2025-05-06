import { useQuery } from '@tanstack/react-query';
import NestAPI from '@/api';
import {
  CountriesAnalyticsControllerGetCitiesWithAlumniCountRequest,
} from '@/sdk';
import { filterApiRequestParams } from '@/utils/query-params';

export const useCityList = (
  params: CountriesAnalyticsControllerGetCitiesWithAlumniCountRequest,
) => {
  const filteredParams = filterApiRequestParams(params);
  const { data, isLoading, isError, isSuccess, isFetching, refetch } =
    useQuery({
    queryKey: ['city-list', filteredParams],
    queryFn: () => NestAPI.countriesAnalyticsControllerGetCitiesWithAlumniCount(filteredParams),
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
