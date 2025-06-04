import NestAPI from "@/api";
import { AlumniControllerUpdateSeniorityLevelRequest } from "@/sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type Input = {
  onSuccess?: () => void | Promise<void>;
};

export const useUpdateSeniority = ({ onSuccess }: Input) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: AlumniControllerUpdateSeniorityLevelRequest) => {
      return NestAPI.alumniControllerUpdateSeniorityLevel({
        id: dto.id,
        updateSeniorityLevelDto: dto.updateSeniorityLevelDto,
      });
    },
    onSuccess: (dto) => {
      queryClient.invalidateQueries({ queryKey: ["role", dto.id] });
      queryClient.invalidateQueries({ queryKey: ["profile", dto.alumniId] });
      onSuccess?.();
    },
  });
};
