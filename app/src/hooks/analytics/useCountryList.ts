import { useQuery } from '@tanstack/react-query';
import NestAPI from '@/api';
import {
  CountriesAnalyticsControllerGetCountriesWithAlumniCountRequest,
} from '@/sdk';

const createQueryKey = (params: CountriesAnalyticsControllerGetCountriesWithAlumniCountRequest) => {
  return [
    'country-list',
    params.limit,
    params.sortBy,
    params.sortOrder,
    params.offset,
  ];
};

export const useCountryList = (
  params: CountriesAnalyticsControllerGetCountriesWithAlumniCountRequest,
) => {
  const { data, isLoading, isError, isSuccess, isFetching, refetch } =
    useQuery({
    queryKey: createQueryKey(params),
    queryFn: () => NestAPI.countriesAnalyticsControllerGetCountriesWithAlumniCount(params),
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