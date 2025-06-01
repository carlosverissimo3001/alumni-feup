import { useMutation, useQueryClient } from "@tanstack/react-query";
import NestAPI from "@/api";
import { AlumniControllerEvaluateSeniorityLevelRequest } from "@/sdk";

type Input = {
  onSuccess?: () => void | Promise<void>;
};

export const useEvaluateSeniority = ({ onSuccess }: Input) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (dto: AlumniControllerEvaluateSeniorityLevelRequest) => {
      return NestAPI.alumniControllerEvaluateSeniorityLevel({
        id: dto.id,
        evaluateSeniorityLevelDto: dto.evaluateSeniorityLevelDto,
      });
    },
    onSuccess: (dto) => {
      queryClient.invalidateQueries({ queryKey: ["role", dto.id] });
      onSuccess?.();
    },
  });

  return mutation;
};
