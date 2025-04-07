import { useQuery } from "@tanstack/react-query";
import { useJsonFromResponse } from "@/commom";
import NestAPI from "@/api";
import { AxiosResponse } from "axios";
import { Faculty } from "@/sdk";

interface UseListFacultiesReturn {
  data: Faculty[] | undefined;
  isLoading: boolean;
  error: string | undefined;
  refetch: () => Promise<void>;
}

export const useListFaculties = (): UseListFacultiesReturn => {
  const query = useQuery({
    queryKey: ["faculties"],
    queryFn: () =>
      NestAPI.facultyControllerFindAll().then(
        (response: AxiosResponse<Faculty[]>) => response.data
      ),
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
