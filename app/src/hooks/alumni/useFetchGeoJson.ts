import { useQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { useJsonFromResponse } from "@/commom";
import { AlumniControllerFindAllGeoJSONGroupByEnum, GeoJSONFeatureCollection } from "@/sdk";
import NestAPI from "@/api";

type Props = {
  groupBy: AlumniControllerFindAllGeoJSONGroupByEnum;
  courseIds?: string[];
  conclusionYears?: number[];
  selectedYear?: number;
};

/**
 * Fetches the GeoJSON data from the API
 * @param courseIds - The ID(s) of the course(s)
 * @param conclusionYears - The conclusion year(s)
 * @returns The GeoJSON data
 */
export const useFetchGeoJson = ({ courseIds, conclusionYears, groupBy, selectedYear }: Props) => {
  const query = useQuery({
    queryKey: ["geoJson", { courseIds, conclusionYears, groupBy, selectedYear }],
    queryFn: () =>
      NestAPI.alumniControllerFindAllGeoJSON(
        groupBy,
        courseIds || [], 
        (conclusionYears || []).map(year => year.toString()),
        selectedYear || undefined
      )
        .then((response: AxiosResponse<GeoJSONFeatureCollection>) => response.data),
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
