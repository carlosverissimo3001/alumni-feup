import NestAPI from "@/api";
import { AlumniControllerEvaluateClassificationRequest } from "@/sdk";
import { useQueryClient, useMutation } from "@tanstack/react-query";

type Input = {
  onSuccess?: () => void | Promise<void>;
};

export const useEvaluateClassifcation = ({ onSuccess }: Input) => {
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (dto: AlumniControllerEvaluateClassificationRequest) => {
      return NestAPI.alumniControllerEvaluateClassification({
        id: dto.id,
        evaluateClassificationDto: dto.evaluateClassificationDto,
      });
    },
    onSuccess: (dto) => {
      qc.invalidateQueries({ queryKey: ["role", dto.id] });
      onSuccess?.();
    },
  });

  return mutation;
};
