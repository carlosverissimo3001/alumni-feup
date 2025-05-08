import { useMutation } from "@tanstack/react-query";
import NestAPI from "@/api";
import { FeedbackControllerCreateRequest } from "@/sdk";
import { useToast } from "@/hooks/misc/useToast";
import { useRouter } from "next/navigation";

export const useSendFeedback = () => {
  const { toast } = useToast();
  const router = useRouter();
  
  const mutation = useMutation<void, Error, FeedbackControllerCreateRequest>({
    mutationFn: (request: FeedbackControllerCreateRequest) =>
      NestAPI.feedbackControllerCreate(request),
    onSuccess: () => {
      toast({
        title: "Feedback Sent",
        description: "Thank you for your feedback!",
        variant: "success",
        duration: 3000,
      });
      router.push("/analytics");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send feedback. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  return {
    ...mutation,
    mutate: (request: FeedbackControllerCreateRequest) => mutation.mutate(request),
  };
};
