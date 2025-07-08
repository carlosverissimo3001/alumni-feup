import { useQuery } from "@tanstack/react-query";
import NestAPI from "@/api";

export const useAlumniExtractBalance = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['alumni-extract-balance'],
    queryFn: () => NestAPI.adminControllerGetAlumniExtractBalance(),
    staleTime: 30000,
  });

  return {
    data,
    isLoading,
    error,
  };
};
