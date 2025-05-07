import { useQuery } from "@tanstack/react-query";
import NestAPI from "@/api";
import { useJsonFromResponse } from "@/commom";

type escoParams = {
  enabled: boolean;
  level: 1 | 2;
};

export const useListEscoClassifications = (params: escoParams) => {
  const query = useQuery({
    queryKey: ["esco", params],
    queryFn: () =>
      params.level === 1
        ? NestAPI.escoControllerGetLevelOneClassifications()
        : NestAPI.escoControllerGetLevelTwoClassifications(),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: params.enabled,
  });

  const parsedError = useJsonFromResponse<{ error?: string }>(
    query.error as unknown as Response | undefined
  );
  const errorFromResponse =
    query.error instanceof Response ? parsedError?.error : undefined;
  const unknownError = query.error ? "Unknown error" : undefined;
  const error =
    errorFromResponse || (query.error as Error)?.message || unknownError;

  return {
    data: query.data,
    isLoading: query.isLoading || query.isFetching,
    error,
    refetch: query.refetch,
  };
};
