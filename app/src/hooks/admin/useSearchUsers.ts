import { useQuery } from "@tanstack/react-query";
import NestAPI from "@/api";

export type UserSearchResult = {
  id: string;
  fullName: string;
  linkedinUrl?: string | null;
};

export const useSearchUsers = (q: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-search-users", q],
    queryFn: async () => {
      const res = await NestAPI.adminControllerSearchUsersRaw({ q });
      return res.raw.json() as Promise<UserSearchResult[]>;
    },
    enabled: q.trim().length >= 2,
    staleTime: 10000,
  });

  return { data: data ?? [], isLoading, error };
};
