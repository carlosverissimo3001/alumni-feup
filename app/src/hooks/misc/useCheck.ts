import { useQuery } from '@tanstack/react-query';
import NestAPI from '@/api';
import { UserControllerCheckPermissionRequest } from '@/sdk';

export const useCheck = (
  params: UserControllerCheckPermissionRequest | null,
) => {
  const { data, isLoading, isError, isSuccess, isFetching, refetch } =
    useQuery({
      queryKey: ['check-permission', params],
      queryFn: async () => {
        if (!params) return undefined;
        const response = await NestAPI.userControllerCheckPermission(params);
        return response.hasPermission;
      },
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, 
      gcTime: 10 * 60 * 1000,
      placeholderData: (previousData) => previousData,
      enabled: !!params,
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
