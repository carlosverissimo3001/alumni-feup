import { useMutation, useQueryClient } from "@tanstack/react-query";
import NestAPI from "@/api";
import { MarkAsReviewedDto } from "@/sdk/api";

type Input = {
  onSuccess?: () => void | Promise<void>
}

const useMarkAlumniReviewed = ({ onSuccess }: Input) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (dto: MarkAsReviewedDto) => {
      return NestAPI.alumniControllerMarkAsReviewed(dto)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumni-to-review"] });
      onSuccess?.();
    }
  });

  return mutation;
};


export default useMarkAlumniReviewed;

