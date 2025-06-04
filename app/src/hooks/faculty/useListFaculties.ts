import { useQuery } from "@tanstack/react-query";
import { useJsonFromResponse } from "@/common";
import NestAPI from "@/api";

export const useListFaculties = () => {
  const query = useQuery({
    queryKey: ["faculties"],
    queryFn: () =>
      NestAPI.facultyControllerFindAll(),
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
    isLoading: query.isLoading || query.isFetching,
    error,
    refetch: query.refetch,
  };
};
