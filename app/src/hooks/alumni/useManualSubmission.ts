import { useMutation } from "@tanstack/react-query";
import { CreateAlumniDto } from "@/sdk/api";
import NestAPI from "@/api";
import { AxiosError } from "axios";


type Input = {
  data: CreateAlumniDto;
  onSuccess?: () => void | Promise<void>;
};

export const useManualSubmission = ({ data, onSuccess }: Input) => {
  const mutation = useMutation(
    {
      mutationFn: () => NestAPI.alumniControllerCreate(data),
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