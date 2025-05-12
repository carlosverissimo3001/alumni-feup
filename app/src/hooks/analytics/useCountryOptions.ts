import { useQuery } from "@tanstack/react-query";
import NestAPI from "@/api";
import { CountryOptionDto } from "@/sdk";


const sortCountries = (countries: CountryOptionDto[]) => {
  return countries.sort((a, b) => a.name.localeCompare(b.name));
};

export const useCountryOptions = () => {
  const { data, isLoading, isError, isSuccess, isFetching, refetch } = useQuery({
    queryKey: ['country-options'],
    queryFn: () => NestAPI.geoAnalyticsControllerGetCountriesOptions().then(sortCountries),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, 
    gcTime: 10 * 60 * 1000,
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
