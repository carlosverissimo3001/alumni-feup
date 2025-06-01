import { useMutation } from "@tanstack/react-query";
import NestAPI from "@/api";
import { EvaluateClassificationDto } from "@/sdk";

type Input = {
  roleId: string;
};

export const useEvaluateClassifcation = ({ roleId }: Input) => {
  const mutation = useMutation({
    mutationFn: (dto: EvaluateClassificationDto) => {
      return NestAPI.alumniControllerEvaluateClassification({
        id: roleId,
        evaluateClassificationDto: dto,
      });
    },
  });

  return mutation;
};
