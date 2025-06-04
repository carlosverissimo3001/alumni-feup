import { useQuery } from "@tanstack/react-query";
import NestAPI from "@/api";
import { useJsonFromResponse } from "@/common/use-json-from-response";
import { AlumniPastLocationsAndCompaniesDto } from "@/sdk/models/AlumniPastLocationsAndCompaniesDto";

interface UseFetchPastLocationsAndCompaniesReturn {
  data: AlumniPastLocationsAndCompaniesDto | undefined;
  isLoading: boolean;
  error: string | undefined;
}

export const useFetchPastLocationsAndCompanies = (id: string): UseFetchPastLocationsAndCompaniesReturn => {
  const query = useQuery({
    queryKey: ['past-locations-companies', id],
    queryFn: () => NestAPI.alumniControllerGetPastLocationsAndCompanies({id})
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
