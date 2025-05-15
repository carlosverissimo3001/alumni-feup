import { useQuery } from "@tanstack/react-query";
import NestAPI from "@/api";
import { CompanyOptionDto } from "@/sdk";

const sortCompanies = (companies: CompanyOptionDto[]) => {
  return companies.sort((a, b) => a.name.localeCompare(b.name));
};

export const useCompanyOptions = () => {
  const { data, isLoading, isError, isSuccess, isFetching, refetch } = useQuery({
    queryKey: ['company-options'],
    queryFn: () =>
      NestAPI.companyAnalyticsControllerGetCompanyOptions().then(
        sortCompanies,
      ),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: undefined,
  });

  return {
    data,
    isLoading,
    isError,
    isSuccess,
    isFetching,
    refetch,
  };
};
