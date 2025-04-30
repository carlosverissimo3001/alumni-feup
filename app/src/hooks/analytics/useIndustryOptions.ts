import { useQuery } from "@tanstack/react-query";
import NestAPI from "@/api";
import { IndustryOptionDto } from "@/sdk";

const sortIndustries = (industries: IndustryOptionDto[]) => {
  return industries.sort((a, b) => a.name.localeCompare(b.name));
};

export const useIndustryOptions = () => {
  const { data, isLoading, isError, isSuccess, isFetching, refetch } = useQuery({
    queryKey: ['industry-options'],
    queryFn: () => NestAPI.industriesAnalyticsControllerGetIndustryOptions().then(sortIndustries),
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
