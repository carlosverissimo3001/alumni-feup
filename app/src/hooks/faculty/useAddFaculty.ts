import { useMutation, useQueryClient } from "@tanstack/react-query";
import NestAPI from "@/api";
import { FacultyControllerCreateRequest, Faculty } from "@/sdk";

export const useAddFaculty = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<Faculty, Error, FacultyControllerCreateRequest>({
    mutationFn: (request: FacultyControllerCreateRequest) =>
      NestAPI.facultyControllerCreate(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
    },
  });

  return {
    ...mutation,
    mutate: (request: FacultyControllerCreateRequest) => mutation.mutate(request),
  };
};
