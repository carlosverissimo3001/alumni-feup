import { useMutation } from "@tanstack/react-query";
import { useJsonFromResponse } from "@/commom";
import NestAPI from "@/api";

type Input = {
  onSuccess?: () => void | Promise<void>;
};

interface ErrorWithResponse extends Error {
  response?: Response;
}

export const useListAlumni = ({ onSuccess }: Input) => {
  const mutation = useMutation({
    mutationFn: () => NestAPI.alumniControllerFindAll(),
    onSuccess,
  });

  const errorFromResponse = useJsonFromResponse<{ error?: string }>(
    (mutation.error as ErrorWithResponse)?.response as Response
  );

  const unknownError = mutation.error ? "Unknown error" : undefined;

  const finalError =
    errorFromResponse?.error ||
    (mutation.error as Error)?.message ||
    unknownError;

  return {
    ...mutation,
    error: finalError,
  };
};
