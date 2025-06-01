import { useQuery } from "@tanstack/react-query";
import NestAPI from "@/api";

type props = {
  enabled?: boolean;
};

export const useRoleOptions = (props: props) => {
  const { data, isLoading, isError, isSuccess, isFetching, refetch } = useQuery({
    queryKey: ['role-options'],
    queryFn: () => NestAPI.roleAnalyticsControllerGetRoleOptions(),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, 
    gcTime: 10 * 60 * 1000,
    placeholderData: undefined,
    enabled: props.enabled ?? true,
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
