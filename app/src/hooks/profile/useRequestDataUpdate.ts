import React from "react";
import { useMutation } from "@tanstack/react-query";
import NestAPI from "@/api";
import { toast } from "@/hooks/misc/useToast";
import { useJsonFromResponse } from "@/commom/use-json-from-response";

type Input = {
  onSuccess?: () => void | Promise<void>;
};

export const useRequestDataUpdate = ({ onSuccess }: Input) => {
  const mutation = useMutation({
    mutationFn: (id: string) => {
      return NestAPI.alumniControllerRequestDataUpdate({ id });
    },
    onSuccess: () => {
      onSuccess?.();
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errorResponse = mutation.error ? (mutation.error as any).response : undefined;
  const parsedError = useJsonFromResponse<{ message?: string }>(
    errorResponse instanceof Response ? errorResponse : undefined
  );

  React.useEffect(() => {
    if (mutation.isError && mutation.error) {
      const errorFromResponse = parsedError?.message;
      const fallbackError = (mutation.error as Error)?.message || "An unknown error occurred";
      const errorMessage = errorFromResponse || fallbackError;

      toast({
        title: "Error requesting profile update",
        variant: "destructive",
        description: errorMessage,
      });
    }
  }, [mutation.isError, mutation.error, parsedError]);

  return mutation;
};
