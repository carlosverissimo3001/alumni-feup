import { useQuery } from "@tanstack/react-query";
import NestAPI from "@/api";

export type Permission = {
  id: string;
  userId: string;
  resource: string;
  actions: string[];
};

export const useGetPermissions = (userId: string | null) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-permissions", userId],
    queryFn: async () => {
      const res = await NestAPI.adminControllerGetPermissionsRaw({ userId: userId! });
      return res.raw.json() as Promise<Permission[]>;
    },
    enabled: !!userId,
  });

  return { data: data ?? [], isLoading, error };
};
