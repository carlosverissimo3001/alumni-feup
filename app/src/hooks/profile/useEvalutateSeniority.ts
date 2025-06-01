import { useMutation, useQueryClient } from "@tanstack/react-query";
import NestAPI from "@/api";
import { EvaluateSeniorityLevelDto } from "@/sdk";

type Input = {
  roleId: string;
  onSuccess?: () => void | Promise<void>;
};

export const useEvaluateSeniority = ({ onSuccess, roleId }: Input) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (dto: EvaluateSeniorityLevelDto) => {
      return NestAPI.alumniControllerAcceptSeniorityLevel({
        id: roleId,
        evaluateSeniorityLevelDto: dto,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumni-to-review"] });
      onSuccess?.();
    },
  });

  return mutation;
};
