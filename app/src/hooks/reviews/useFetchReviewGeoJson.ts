import { useQuery } from "@tanstack/react-query";
import { useJsonFromResponse } from "@/commom";
import { AlumniControllerFindAllGeoJSONGroupByEnum } from "@/sdk";
import NestAPI from "@/api";

type Props = {
  groupBy: AlumniControllerFindAllGeoJSONGroupByEnum;
  reviewType?: string;
};

/**
 * Fetches the GeoJSON data from the API
 * @param courseIds - The ID(s) of the course(s)
 * @param conclusionYears - The conclusion year(s)
 * @returns The GeoJSON data
 */
export const useFetchReviewGeoJson = ({ groupBy, reviewType }: Props) => {
  const query = useQuery({
    queryKey: ["geoJson", {groupBy, reviewType}],
    queryFn: () =>
      NestAPI.reviewsControllerFindAllGeoJSON({
        groupBy,
        reviewType: reviewType || ''
      }),
    staleTime: 1000 * 60 * 60 * 24, // Fresh for 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // Cache for 7 days
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: true
  });

  const parsedError = useJsonFromResponse<{ error?: string }>(query.error as unknown as Response | undefined);
  const errorFromResponse = query.error instanceof Response ? parsedError?.error : undefined;
  const error = errorFromResponse || (query.error as Error)?.message || "Unknown error";

  return {
    data: query.data,
    isLoading: query.isLoading,
    error,
    refetch: query.refetch,
  };
};
