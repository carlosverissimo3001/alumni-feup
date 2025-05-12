import { useQuery } from "@tanstack/react-query";
import NestAPI from "@/api";
import { CityOptionDto, GeoAnalyticsControllerGetCitiesOptionsRequest } from "@/sdk";


const sortCities = (cities: CityOptionDto[]) => {
  return cities.sort((a, b) => a.country.localeCompare(b.country));
};

export const useCityOptions = (params: GeoAnalyticsControllerGetCitiesOptionsRequest) => {
  const { data, isLoading, isError, isSuccess, isFetching, refetch } = useQuery({
    queryKey: ['city-options', params],
    queryFn: () => NestAPI.geoAnalyticsControllerGetCitiesOptions(params).then(sortCities),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, 
    gcTime: 10 * 60 * 1000,
    placeholderData: undefined,
    enabled: !!params.countryCodes && params.countryCodes.length > 0,
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
