import {
  AnalyticsControllerGetAnalyticsRequest,
} from "@/sdk";
import { useQuery } from "@tanstack/react-query";
import NestAPI from "@/api";
import { filterApiRequestParams } from "@/utils/query-params";

interface UseFetchAnalyticsProps {
  params: AnalyticsControllerGetAnalyticsRequest;
  options?: {
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
    isInitialLoad?: boolean;
  };
}

export const useFetchAnalytics = ({
  params,
  options = {},
}: UseFetchAnalyticsProps) => {
  const filteredParams = {
    ...filterApiRequestParams(params),
  };

  const isInitial = options.isInitialLoad ?? false;
  const queryKey = isInitial
    ? ["analytics", "initial", filteredParams]
    : ["analytics", params.selectorType, filteredParams];

  return useQuery({
    queryKey,
    queryFn: () => NestAPI.analyticsControllerGetAnalytics(filteredParams),
    enabled: options.enabled ?? true,
    staleTime: options.staleTime ?? 5 * 60 * 1000,
    gcTime: options.gcTime ?? 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    placeholderData: undefined,
  });
};
