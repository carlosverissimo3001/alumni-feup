import { useQuery } from "@tanstack/react-query";
import NestAPI from "@/api";
import { AlumniControllerGetBasicProfileRequest, BasicAlumniProfileDto } from "@/sdk";
import { useJsonFromResponse } from "@/commom/use-json-from-response";

interface UseFetchBasicProfileReturn {
  data: BasicAlumniProfileDto | undefined;
  isLoading: boolean;
  error: string | undefined;
}

export const useFetchBasicProfile = (params: AlumniControllerGetBasicProfileRequest): UseFetchBasicProfileReturn => {
  const query = useQuery({
    queryKey: ['basic-profile', params.id],
    queryFn: () => NestAPI.alumniControllerGetBasicProfile(params)
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
