import { useMutation } from "@tanstack/react-query";
import NestAPI from "@/api";
import { AxiosError } from "axios";
import { ChangeReviewScoreDto } from "@/sdk/models/ChangeReviewScoreDto";


type Input = {
  data: ChangeReviewScoreDto;
  onSuccess?: () => void | Promise<void>;
};

export const useChangeReviewScore = ({ data, onSuccess }: Input) => {
  const mutation = useMutation(
    {
      mutationFn: () => NestAPI.reviewControllerChangeScore({changeReviewScoreDto: data}),
      onSuccess
    }
  );

  // Extract error message from Axios error response
  const getErrorMessage = () => {
    if (!mutation.error) return undefined;
    
    const axiosError = mutation.error as AxiosError<{message?: string}>;
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    
    return (mutation.error as Error)?.message || 'Unknown error';
  };

  return {
      ...mutation,
      error: getErrorMessage(),
  }
};