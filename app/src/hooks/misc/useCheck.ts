import { useQuery } from '@tanstack/react-query';
import NestAPI from '@/api';
import { UserControllerCheckPermissionRequest } from '@/sdk';

export const useCheck = (
  params: UserControllerCheckPermissionRequest | null,
) => {
  const { data: rawData, isLoading, isError, isSuccess, isFetching, refetch } =
    useQuery({
      queryKey: ['check-permission', params],
      queryFn: async () => {
        if (!params) return undefined;
        const response = await NestAPI.userControllerCheckPermission(params);
        // Explicitly convert response to boolean to ensure consistent type
        return Boolean(response);
      },
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, 
      gcTime: 10 * 60 * 1000,
      placeholderData: (previousData) => previousData,
      enabled: !!params,
    });

  // Ensure we always return a boolean or undefined
  // Maybe the BE should take care of this
  const data = typeof rawData !== 'undefined' ? Boolean(rawData) : undefined;

  return {
    data,
    isLoading,
    isError,
    isSuccess,
    isFetching,
    refetch,
  };
};
