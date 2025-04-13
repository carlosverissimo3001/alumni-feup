import { useQuery } from "@tanstack/react-query";
import NestAPI from "@/api";

export const useBrightDataBalance = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['brightdata-balance'],
    queryFn: () => NestAPI.adminControllerGetBrightDataBalance(),
    staleTime: 30000,
  });

  return {
    data,
    isLoading,
    error,
  };
};
