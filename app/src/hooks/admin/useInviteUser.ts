import { useMutation } from "@tanstack/react-query";
import NestAPI from "@/api";
import { AdminControllerInviteUserRequest } from "@/sdk";

export const useInviteUser = () => {
  const { mutateAsync: mutate, isPending, error } = useMutation({
    mutationFn: (params: AdminControllerInviteUserRequest) =>
      NestAPI.adminControllerInviteUser(params),
  });

  return {
    mutate,
    isLoading: isPending,
    error,
  };
};
