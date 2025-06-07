import { useQuery } from "@tanstack/react-query";
import NestAPI from "@/api";
import { AlumniControllerGetProfileRequest, AlumniAnalyticsEntity } from "@/sdk";
import { useJsonFromResponse } from "@/common/use-json-from-response";

interface UseFetchProfileReturn {
  data?: AlumniAnalyticsEntity;
  isLoading: boolean;
  error?: string;
}

export const useFetchProfile = (params: AlumniControllerGetProfileRequest): UseFetchProfileReturn => {
  const query = useQuery({
    queryKey: ['profile', params.id],
    queryFn: () => NestAPI.alumniControllerGetProfile(params)
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
    isLoading: query.isLoading,
    error,
  };
};
