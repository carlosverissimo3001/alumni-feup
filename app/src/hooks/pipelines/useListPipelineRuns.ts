import { useQuery } from "@tanstack/react-query";
import NestAPI from "@/api";
import {
  PipelinesControllerListRunsRequest,
  RunSummaryDtoStatusEnum,
} from "@/sdk";

const ACTIVE_STATUSES: RunSummaryDtoStatusEnum[] = [
  RunSummaryDtoStatusEnum.Planning,
  RunSummaryDtoStatusEnum.Planned,
  RunSummaryDtoStatusEnum.Running,
];

type UseListPipelineRunsProps = {
  params?: PipelinesControllerListRunsRequest;
};

export const useListPipelineRuns = ({
  params,
}: UseListPipelineRunsProps = {}) => {
  const query = useQuery({
    queryKey: ["pipeline-runs", params],
    queryFn: () => NestAPI.pipelinesControllerListRuns(params),
    refetchInterval: (q) => {
      const hasActiveRun = q.state.data?.items.some((run) =>
        ACTIVE_STATUSES.includes(run.status)
      );
      return hasActiveRun ? 5000 : false;
    },
  });

  const isPolling = !!query.data?.items.some((run) =>
    ACTIVE_STATUSES.includes(run.status)
  );

  return {
    data: query.data?.items,
    nextCursor: query.data?.nextCursor,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isPolling,
    error: query.error,
    refetch: query.refetch,
  };
};
