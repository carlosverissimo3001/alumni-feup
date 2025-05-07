import { useMutation } from "@tanstack/react-query";
import NestAPI from "@/api";
import { MergeLocationsDto } from "@/sdk";

export const useMergeLocations = () => {
  const mutation = useMutation({
    mutationFn: (mergeLocationsDto: MergeLocationsDto) =>
      NestAPI.adminControllerMergeLocations({
        mergeLocationsDto,
      }),
  });

  return mutation;
};

