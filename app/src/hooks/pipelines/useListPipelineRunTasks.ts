import { useQuery } from "@tanstack/react-query";
import NestAPI from "@/api";
import {
  PipelinesControllerListRunTasksStageEnum,
  PipelinesControllerListRunTasksStatusEnum,
} from "@/sdk";

type UseListPipelineRunTasksProps = {
  runId: string;
  status?: PipelinesControllerListRunTasksStatusEnum;
  stage?: PipelinesControllerListRunTasksStageEnum;
  cursor?: string;
  shouldPoll?: boolean;
};

export const useListPipelineRunTasks = ({
  runId,
  status,
  stage,
  cursor,
  shouldPoll = false,
}: UseListPipelineRunTasksProps) => {
  const query = useQuery({
    queryKey: ["pipeline-run-tasks", runId, status, stage, cursor],
    queryFn: () =>
      NestAPI.pipelinesControllerListRunTasks({
        runId,
        status,
        stage,
        cursor,
        limit: 25,
      }),
    refetchInterval: shouldPoll ? 5000 : false,
    enabled: !!runId,
  });

  return {
    data: query.data?.items,
    nextCursor: query.data?.nextCursor,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
