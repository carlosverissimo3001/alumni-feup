import { useMutation } from "@tanstack/react-query";
import NestAPI from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import { AlumniControllerUpdateRoleVisibilityRequest } from "@/sdk";

type Input = {
  onSuccess?: () => void | Promise<void>;
};

export const useUpdateRoleVisibility = ({ onSuccess }: Input) => {
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (params: AlumniControllerUpdateRoleVisibilityRequest) => {
      return NestAPI.alumniControllerUpdateRoleVisibility({
        updateRoleVisibilityDto: params.updateRoleVisibilityDto,
      });
    },
    onSuccess: (role) => {
      qc.invalidateQueries({ queryKey: ["profile", role.alumniId] });
      onSuccess?.();
    },
  });

  return mutation;
};
