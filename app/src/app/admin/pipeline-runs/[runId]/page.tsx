"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { AdminBackLink } from "@/components/admin/adminBackLink";
import { RefreshIndicator } from "@/components/admin/pipelines/refreshIndicator";
import { useGetPipelineRun } from "@/hooks/pipelines/useGetPipelineRun";
import { useListPipelineRunTasks } from "@/hooks/pipelines/useListPipelineRunTasks";
import {
  PipelinesControllerListRunTasksStageEnum,
  PipelinesControllerListRunTasksStatusEnum,
  RunDetailDtoStatusEnum,
  TaskSummaryDto,
} from "@/sdk";
import {
  formatDateTime,
  formatDuration,
  formatEnumLabel,
  progressIndicatorClassName,
  statusBadgeClassName,
} from "@/components/admin/pipelines/pipelineFormat";

const STAGE_OPTIONS = Object.values(PipelinesControllerListRunTasksStageEnum);
const TASK_STATUS_OPTIONS = Object.values(
  PipelinesControllerListRunTasksStatusEnum
);

const ACTIVE_RUN_STATUSES: RunDetailDtoStatusEnum[] = [
  RunDetailDtoStatusEnum.Planning,
  RunDetailDtoStatusEnum.Planned,
  RunDetailDtoStatusEnum.Running,
];

const PipelineRunDetailPage = () => {
  const { runId } = useParams<{ runId: string }>();

  const [taskStatus, setTaskStatus] = useState<string>("all");
  const [taskStage, setTaskStage] = useState<string>("all");
  const [cursors, setCursors] = useState<string[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskSummaryDto | null>(null);

  const {
    data: run,
    isLoading: isLoadingRun,
    isFetching: isFetchingRun,
    isPolling,
    refetch: refetchRun,
  } = useGetPipelineRun(runId);

  const shouldPollTasks = !!run && ACTIVE_RUN_STATUSES.includes(run.status);
  const currentCursor = cursors[cursors.length - 1];

  const {
    data: tasks,
    nextCursor,
    isLoading: isLoadingTasks,
    refetch: refetchTasks,
  } = useListPipelineRunTasks({
      runId,
      status:
        taskStatus === "all"
          ? undefined
          : (taskStatus as PipelinesControllerListRunTasksStatusEnum),
      stage:
        taskStage === "all"
          ? undefined
          : (taskStage as PipelinesControllerListRunTasksStageEnum),
      cursor: currentCursor,
      shouldPoll: shouldPollTasks,
    });

  const resetTaskPaging = () => setCursors([]);

  const handleRefreshNow = () => {
    refetchRun();
    refetchTasks();
  };

  if (isLoadingRun) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#8C2D19] border-t-transparent" />
      </div>
    );
  }

  if (!run) {
    return (
      <div className="container mx-auto py-8 text-center text-gray-500">
        Run not found.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <AdminBackLink href="/admin/pipeline-runs" className="mb-3" />
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold tracking-tight">
              {run.kind ? formatEnumLabel(run.kind) : "Pipeline Run"}
              {run.label && <span className="text-muted-foreground"> · {run.label}</span>}
            </h1>
            {isPolling && (
              <RefreshIndicator
                intervalMs={5000}
                onRefresh={handleRefreshNow}
                isRefreshing={isFetchingRun}
              />
            )}
          </div>
          <p className="text-sm text-muted-foreground font-mono">{run.id}</p>
        </div>

        <Card className="shadow-lg border border-gray-200 rounded-lg">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge className={statusBadgeClassName(run.status)}>
                  {formatEnumLabel(run.status)}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Trigger</p>
                <p className="font-medium">{formatEnumLabel(run.triggerSource)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Started</p>
                <p className="font-medium">{formatDateTime(run.startedAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Duration</p>
                <p className="font-medium">
                  {formatDuration(run.startedAt, run.finishedAt)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Succeeded / Failed / Total</p>
                <p className="font-medium">
                  {run.counts.succeeded} / {run.counts.failed} / {run.counts.total}
                </p>
              </div>
            </div>
            {run.error && (
              <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {run.error}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg border border-gray-200 rounded-lg">
          <CardHeader className="py-4">
            <CardTitle className="text-xl text-[#8C2D19]">Stages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {run.stages
              .slice()
              .sort((a, b) => a.sequence - b.sequence)
              .map((stage) => {
                const progressPct =
                  stage.totalCount > 0
                    ? ((stage.succeededCount + stage.failedCount + stage.skippedCount) /
                        stage.totalCount) *
                      100
                    : stage.status === "COMPLETED" || stage.status === "SKIPPED"
                      ? 100
                      : 0;
                return (
                  <div key={stage.stage} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatEnumLabel(stage.stage)}</span>
                        <Badge className={statusBadgeClassName(stage.status)}>
                          {formatEnumLabel(stage.status)}
                        </Badge>
                      </div>
                      <span className="text-muted-foreground text-xs">
                        {stage.succeededCount} succeeded · {stage.failedCount} failed ·{" "}
                        {stage.skippedCount} skipped · {stage.totalCount} total ·{" "}
                        {formatDuration(stage.startedAt, stage.finishedAt)}
                      </span>
                    </div>
                    <Progress
                      value={progressPct}
                      indicatorClassName={progressIndicatorClassName(stage.status)}
                    />
                    {stage.error && (
                      <p className="text-xs text-red-700">{stage.error}</p>
                    )}
                  </div>
                );
              })}
          </CardContent>
        </Card>

        <Card className="shadow-lg border border-gray-200 rounded-lg">
          <CardHeader className="py-4">
            <CardTitle className="flex items-center justify-between text-xl text-[#8C2D19]">
              <span>Tasks</span>
              <div className="flex gap-3">
                <Select
                  value={taskStage}
                  onValueChange={(v) => {
                    setTaskStage(v);
                    resetTaskPaging();
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    {STAGE_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {formatEnumLabel(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={taskStatus}
                  onValueChange={(v) => {
                    setTaskStatus(v);
                    resetTaskPaging();
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {TASK_STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {formatEnumLabel(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingTasks ? (
              <div className="flex justify-center py-6">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#8C2D19] border-t-transparent" />
              </div>
            ) : tasks && tasks.length > 0 ? (
              <>
                <div className="overflow-x-auto overflow-y-auto max-h-[500px] scrollbar-thin">
                  <table className="w-full">
                    <thead className="sticky top-0 z-10">
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-2 px-3 text-[#8C2D19] text-sm">
                          Stage
                        </th>
                        <th className="text-left py-2 px-3 text-[#8C2D19] text-sm">
                          Entity
                        </th>
                        <th className="text-left py-2 px-3 text-[#8C2D19] text-sm">
                          Status
                        </th>
                        <th className="text-left py-2 px-3 text-[#8C2D19] text-sm">
                          Attempts
                        </th>
                        <th className="text-left py-2 px-3 text-[#8C2D19] text-sm">
                          Finished
                        </th>
                        <th className="text-left py-2 px-3 text-[#8C2D19] text-sm">
                          Error
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task) => (
                        <tr
                          key={task.id}
                          className="border-b hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                          onClick={() => setSelectedTask(task)}
                        >
                          <td className="py-2 px-3 text-gray-700 text-sm">
                            {formatEnumLabel(task.stage)}
                          </td>
                          <td className="py-2 px-3 text-gray-700 text-sm font-mono">
                            {formatEnumLabel(task.entityType)} · {task.entityId}
                          </td>
                          <td className="py-2 px-3 text-sm">
                            <Badge className={statusBadgeClassName(task.status)}>
                              {formatEnumLabel(task.status)}
                            </Badge>
                          </td>
                          <td className="py-2 px-3 text-gray-700 text-sm">
                            {task.attempts}
                          </td>
                          <td className="py-2 px-3 text-gray-700 text-sm">
                            {formatDateTime(task.finishedAt)}
                          </td>
                          <td className="py-2 px-3 text-red-700 text-sm max-w-xs truncate">
                            {task.error ?? "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={cursors.length === 0}
                    onClick={() => setCursors((c) => c.slice(0, -1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!nextCursor}
                    onClick={() => nextCursor && setCursors((c) => [...c, nextCursor])}
                  >
                    Next
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-6 text-gray-500">No tasks found.</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Sheet
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
      >
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedTask && (
            <>
              <SheetHeader>
                <SheetTitle>
                  {formatEnumLabel(selectedTask.entityType)} · {selectedTask.entityId}
                </SheetTitle>
                <SheetDescription className="font-mono text-xs">
                  {selectedTask.id}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground">Stage</p>
                    <p className="font-medium">{formatEnumLabel(selectedTask.stage)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge className={statusBadgeClassName(selectedTask.status)}>
                      {formatEnumLabel(selectedTask.status)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Attempts</p>
                    <p className="font-medium">{selectedTask.attempts}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Started</p>
                    <p className="font-medium">{formatDateTime(selectedTask.startedAt)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Finished</p>
                    <p className="font-medium">{formatDateTime(selectedTask.finishedAt)}</p>
                  </div>
                </div>
                {selectedTask.error && (
                  <div>
                    <p className="text-muted-foreground mb-1">Error</p>
                    <pre className="whitespace-pre-wrap break-words text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 text-xs">
                      {selectedTask.error}
                    </pre>
                  </div>
                )}
                {selectedTask.result && (
                  <div>
                    <p className="text-muted-foreground mb-1">Result</p>
                    <pre className="whitespace-pre-wrap break-words bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-xs">
                      {JSON.stringify(selectedTask.result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default PipelineRunDetailPage;
