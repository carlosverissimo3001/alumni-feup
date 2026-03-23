import { useMutation } from "@tanstack/react-query";
import NestAPI from "@/api";
import { AdminControllerUpsertPermissionRequest } from "@/sdk";

export const useUpsertPermission = () => {
  const { mutateAsync: mutate, isPending, error } = useMutation({
    mutationFn: (params: AdminControllerUpsertPermissionRequest) =>
      NestAPI.adminControllerUpsertPermission(params),
  });

  return { mutate, isLoading: isPending, error };
};
