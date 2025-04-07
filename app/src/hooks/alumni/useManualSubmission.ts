import { useMutation } from "@tanstack/react-query";
import { CreateAlumniDto } from "@/sdk/api";
import NestAPI from "@/api";


export const useManualSubmission = () => {
  return useMutation({
    mutationFn: async (data: CreateAlumniDto) => {
      try {
        const response = await NestAPI.alumniControllerCreate(data);
        return response.data;
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Failed to submit application');
      }
    },
    onError: (error: Error) => {
      console.error('Manual submission error:', error.message);
    }
  });
};