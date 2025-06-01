import { useQuery } from "@tanstack/react-query";
import NestAPI from "@/api";

export const useFetchRole = (id: string) => {
  return useQuery({
    queryKey: ["role", id],
    queryFn: () => NestAPI.roleAnalyticsControllerGetRole({ id }),
    refetchOnWindowFocus: false,
  });
};
