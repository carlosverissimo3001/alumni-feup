import { useQuery } from "@tanstack/react-query";
import NestAPI from "@/api";
import { RoleOptionDto } from "@/sdk";


const sortRoles = (roles: RoleOptionDto[]) => {
  return roles.sort((a, b) => a.title.localeCompare(b.title));
};

export const useRoleOptions = () => {
  const { data, isLoading, isError, isSuccess, isFetching, refetch } = useQuery({
    queryKey: ['role-options'],
    queryFn: () => NestAPI.roleAnalyticsControllerGetRoleOptions().then(sortRoles),
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
