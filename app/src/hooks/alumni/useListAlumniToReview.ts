import { useQuery, QueryObserverResult } from "@tanstack/react-query";
import { useJsonFromResponse } from "@/commom";
import NestAPI from "@/api";
import { Alumni } from "@/sdk";

interface UseListAlumniToReviewReturn {
  data: Alumni[] | undefined;
  isLoading: boolean;
  error: string | undefined;
  refetch: () => Promise<QueryObserverResult<Alumni[], Error>>;
}

export const useListAlumniToReview = (): UseListAlumniToReviewReturn => {
  const query = useQuery({
    queryKey: ["alumni-to-review"],
    queryFn: () => NestAPI.alumniControllerGetAlumniToReview(),
    staleTime: Infinity, // Data will never become stale automatically
    gcTime: Infinity, // Cache will never be cleared automatically (formerly cacheTime)
    refetchOnMount: false, // Don't refetch when component mounts
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
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
    refetch: query.refetch,
  };
};
