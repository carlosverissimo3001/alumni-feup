import { useMutation } from "@tanstack/react-query";
import NestAPI from "@/api";
import { MergeCompaniesDto } from "@/sdk";

export const useMergeCompanies = () => {
  const mutation = useMutation({
    mutationFn: (mergeCompaniesDto: MergeCompaniesDto) =>
      NestAPI.adminControllerMergeCompanies({
        mergeCompaniesDto,
      }),
  });

  return mutation;
};

