import { useQuery } from "@tanstack/react-query";
import { useJsonFromResponse } from "@/commom";
import NestAPI from "@/api";
import { CourseControllerFindRequest } from "@/sdk";

type UseListCoursesProps = {
  enabled?: boolean;
  params: CourseControllerFindRequest;
};

export const useListCourses = ({
  params,
  enabled = true,
}: UseListCoursesProps) => {
  const query = useQuery({
    queryKey: ["courses", params],
    queryFn: () => NestAPI.courseControllerFind(params),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled,
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
