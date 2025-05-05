import { useMutation, useQueryClient } from "@tanstack/react-query";
import NestAPI from "@/api";
import { Course, CourseControllerCreateRequest } from "@/sdk";

export const useAddCourse = () => {
  const queryClient = useQueryClient();
  return useMutation<Course, Error, CourseControllerCreateRequest>({
    mutationFn: (request: CourseControllerCreateRequest) =>
      NestAPI.courseControllerCreate(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"]});
    },
  });
};
