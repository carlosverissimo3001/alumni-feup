import { useMutation } from "@tanstack/react-query";
import { useJsonFromResponse, ResponseError } from "@/commom";
import NestAPI from "@/api";

type Input = {
    onSuccess?: () => void | Promise<void>
}

export const useListAlumni = ({ onSuccess }: Input) => {
    const mutation = useMutation({
        mutationFn: () => NestAPI.alumniControllerFindAll(),
        onSuccess
    });

    const errorFromResponse = useJsonFromResponse<{error?: string}>(mutation.error as ResponseError)?.error;

    const unknownError = mutation.error ? 'Unknown error' : undefined;

    const finalError = errorFromResponse?.error || (mutation.error as Error)?.message || unknownError;

    return {
        ...mutation,
        error: finalError,
    }
}
