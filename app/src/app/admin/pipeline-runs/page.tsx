"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useListPipelineRuns } from "@/hooks/pipelines/useListPipelineRuns";
import {
  PipelinesControllerListRunsKindEnum,
  PipelinesControllerListRunsStatusEnum,
} from "@/sdk";
import {
  formatDateTime,
  formatDuration,
  formatEnumLabel,
  statusBadgeClassName,
} from "@/components/admin/pipelines/pipelineFormat";

const KIND_OPTIONS = Object.values(PipelinesControllerListRunsKindEnum);
const STATUS_OPTIONS = Object.values(PipelinesControllerListRunsStatusEnum);

const PipelineRunsPage = () => {
  const router = useRouter();
  const [kind, setKind] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  const { data: runs, isLoading } = useListPipelineRuns({
    params: {
      kind: kind === "all" ? undefined : (kind as PipelinesControllerListRunsKindEnum),
      status:
        status === "all" ? undefined : (status as PipelinesControllerListRunsStatusEnum),
    },
  });

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Pipeline Runs</h1>
            <p className="text-sm text-muted-foreground">
              View-only: current and past alumni data pipeline runs.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <Card className="shadow-lg border border-gray-200 rounded-lg">
          <CardHeader className="py-4">
            <CardTitle className="flex items-center justify-between text-xl text-[#8C2D19]">
              <span>Runs {runs && runs.length > 0 && `(${runs.length})`}</span>
              <div className="flex gap-3">
                <Select value={kind} onValueChange={setKind}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Kind" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Kinds</SelectItem>
                    {KIND_OPTIONS.map((k) => (
                      <SelectItem key={k} value={k}>
                        {formatEnumLabel(k)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {STATUS_OPTIONS.map((s) => (
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
            {isLoading ? (
              <div className="flex justify-center py-6">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#8C2D19] border-t-transparent" />
              </div>
            ) : runs && runs.length > 0 ? (
              <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
                <table className="w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-2 px-3 text-[#8C2D19] text-sm">Kind</th>
                      <th className="text-left py-2 px-3 text-[#8C2D19] text-sm">Status</th>
                      <th className="text-left py-2 px-3 text-[#8C2D19] text-sm">Trigger</th>
                      <th className="text-left py-2 px-3 text-[#8C2D19] text-sm">
                        Succeeded / Failed / Total
                      </th>
                      <th className="text-left py-2 px-3 text-[#8C2D19] text-sm">Started</th>
                      <th className="text-left py-2 px-3 text-[#8C2D19] text-sm">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runs.map((run) => (
                      <tr
                        key={run.id}
                        className="border-b hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                        onClick={() => router.push(`/admin/pipeline-runs/${run.id}`)}
                      >
                        <td className="py-2 px-3 text-gray-700 text-sm">
                          {run.kind ? formatEnumLabel(run.kind) : "-"}
                        </td>
                        <td className="py-2 px-3 text-sm">
                          <Badge className={statusBadgeClassName(run.status)}>
                            {formatEnumLabel(run.status)}
                          </Badge>
                        </td>
                        <td className="py-2 px-3 text-gray-700 text-sm">
                          {formatEnumLabel(run.triggerSource)}
                        </td>
                        <td className="py-2 px-3 text-gray-700 text-sm">
                          {run.counts.succeeded} / {run.counts.failed} /{" "}
                          {run.counts.total}
                        </td>
                        <td className="py-2 px-3 text-gray-700 text-sm">
                          {formatDateTime(run.startedAt)}
                        </td>
                        <td className="py-2 px-3 text-gray-700 text-sm">
                          {formatDuration(run.startedAt, run.finishedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">No pipeline runs found.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PipelineRunsPage;
