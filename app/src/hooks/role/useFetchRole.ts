import { useQuery } from "@tanstack/react-query";
import NestAPI from "@/api";

type UseFetchRoleParams = {
  id: string;
  includeMetadata?: boolean;
};

export const useFetchRole = ({ id, includeMetadata }: UseFetchRoleParams) => {
  return useQuery({
    queryKey: ["role", id],
    queryFn: () =>
      NestAPI.roleAnalyticsControllerGetRole({ id, includeMetadata }),
    refetchOnWindowFocus: false,
  });
};
