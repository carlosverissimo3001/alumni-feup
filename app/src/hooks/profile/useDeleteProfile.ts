import { useMutation } from "@tanstack/react-query";
import NestAPI from "@/api";

type Input = {
  onSuccess?: () => void | Promise<void>;
};

export const useDeleteProfile = ({ onSuccess }: Input) => {
  const mutation = useMutation({
    mutationFn: (id: string) => {
      return NestAPI.userControllerDeleteUser({ id });
    },
    onSuccess: () => {
      onSuccess?.();
    },
  });

  return mutation;
};
