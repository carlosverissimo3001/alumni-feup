import NestAPI from "@/api";
import { AlumniControllerUpdateClassificationRequest } from "@/sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type Input = {
  onSuccess?: () => void | Promise<void>;
};

export const useUpdateClassification = ({ onSuccess }: Input) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: AlumniControllerUpdateClassificationRequest) => {
      return NestAPI.alumniControllerUpdateClassification({
        id: dto.id,
        updateClassificationDto: dto.updateClassificationDto,
      });
    },
    onSuccess: (dto) => {
      queryClient.invalidateQueries({ queryKey: ["role", dto.id] });

      // Force a refresh of the profile
      queryClient.invalidateQueries({ queryKey: ["profile", dto.alumniId] });
      onSuccess?.();
    },
  });
};
