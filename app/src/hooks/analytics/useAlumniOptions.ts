import { useQuery } from "@tanstack/react-query";
import NestAPI from "@/api";

export const useAlumniOptions = () => {
  const { data, isLoading, isError, isSuccess, isFetching, refetch } = useQuery({
    queryKey: ['alumni-options'],
    queryFn: () => NestAPI.alumniAnalyticsControllerGetAlumniOptions(),
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
