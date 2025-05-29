import NestAPI from "@/api";

import { useQuery } from "@tanstack/react-query";

export const useGetRoleHierarchy = (code: string) => {
  const { data, isLoading, isError, isSuccess, isFetching, refetch } = useQuery({
    queryKey: ['role-hierarchy', code],
    queryFn: () => NestAPI.roleAnalyticsControllerGetRoleHierarchy({ code }),
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
