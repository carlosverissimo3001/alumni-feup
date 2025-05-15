import { useQuery } from "@tanstack/react-query";
import NestAPI from "@/api";

export const useCompanyInsights = (id: string) => {
  return useQuery({
    queryKey: ['company-insights', id],
    queryFn: () =>
      NestAPI.companyAnalyticsControllerGetCompanyDetails({ id }),
  });
};
