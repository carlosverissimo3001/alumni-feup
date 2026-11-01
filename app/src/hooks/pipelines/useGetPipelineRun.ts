import { useQuery } from "@tanstack/react-query";
import NestAPI from "@/api";
import { RunDetailDtoStatusEnum } from "@/sdk";

const ACTIVE_STATUSES: RunDetailDtoStatusEnum[] = [
  RunDetailDtoStatusEnum.Planning,
  RunDetailDtoStatusEnum.Planned,
  RunDetailDtoStatusEnum.Running,
];

export const useGetPipelineRun = (runId: string) => {
  const query = useQuery({
    queryKey: ["pipeline-run", runId],
    queryFn: () => NestAPI.pipelinesControllerGetRun({ runId }),
    refetchInterval: (q) =>
      q.state.data && ACTIVE_STATUSES.includes(q.state.data.status)
        ? 5000
        : false,
    enabled: !!runId,
  });

  const isPolling = !!(
    query.data && ACTIVE_STATUSES.includes(query.data.status)
  );

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isPolling,
    error: query.error,
    refetch: query.refetch,
  };
};
