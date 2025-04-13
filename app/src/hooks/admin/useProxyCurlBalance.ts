import { useQuery } from "@tanstack/react-query";
import NestAPI from "@/api";

export const useProxyCurlBalance = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['proxycurl-balance'],
    queryFn: () => NestAPI.adminControllerGetProxyCurlBalance(),
    staleTime: 30000,
  });

  return {
    data,
    isLoading,
    error,
  };
};
