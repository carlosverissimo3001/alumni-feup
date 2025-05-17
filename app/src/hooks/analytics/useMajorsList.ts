import { useQuery } from "@tanstack/react-query";
import NestAPI from "@/api";
import { EducationAnalyticsControllerGetMajorsRequest } from "@/sdk";
import { filterApiRequestParams } from "@/utils/query-params";

export const useMajorsList = (
  params: EducationAnalyticsControllerGetMajorsRequest,
  enabled: boolean = true,
) => {
  const filteredParams = {
    ...filterApiRequestParams(params),
    includeTrend: params.includeTrend ?? false,
  };
  const { data, isLoading, isError, isSuccess, isFetching, refetch } = useQuery(
    {
      queryKey: ["major-dashboard-list", filteredParams],
      queryFn: () =>
        NestAPI.educationAnalyticsControllerGetMajors(filteredParams),
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      placeholderData: (previousData) => previousData,
      enabled,
    }
  );

  return {
    data,
    isLoading,
    isError,
    isSuccess,
    isFetching,
    refetch,
  };
};
