import { useMutation } from "@tanstack/react-query";
import NestAPI from "@/api";
import { AxiosError } from "axios";
import { CreateReviewDto } from "@/sdk/models/CreateReviewDto";


type Input = {
  data: CreateReviewDto;
  onSuccess?: () => void | Promise<void>;
};

export const useReviewSubmit = ({ data, onSuccess }: Input) => {
  const mutation = useMutation(
    {
      mutationFn: () => NestAPI.reviewControllerCreate({createReviewDto: data}),
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