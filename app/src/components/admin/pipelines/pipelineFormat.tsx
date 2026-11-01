import { formatDistanceStrict } from "date-fns";

// Status enums are structurally identical across Run/Stage/Task DTOs
// (PLANNING/PLANNED/RUNNING/COMPLETED/FAILED/CANCELLED, or the stage/task
// subsets of it) - this takes the string value directly rather than one
// enum type so every call site doesn't need its own cast.
export const statusBadgeClassName = (status: string): string => {
  switch (status) {
    case "RUNNING":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "SUCCEEDED":
    case "COMPLETED":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "FAILED":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    case "CANCELLED":
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    case "SKIPPED":
      return "bg-gray-100 text-gray-500 hover:bg-gray-200";
    case "PLANNING":
    case "PLANNED":
    case "QUEUED":
    case "PENDING":
    default:
      return "bg-amber-100 text-amber-800 hover:bg-amber-200";
  }
};

export const formatEnumLabel = (value: string): string =>
  value
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");

export const formatDateTime = (date: Date | null): string =>
  date
    ? new Date(date).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

// A run/stage still in progress has no finishedAt - measure against now
// instead, which is also why callers polling this need refetchInterval.
export const formatDuration = (
  startedAt: Date | null,
  finishedAt: Date | null
): string => {
  if (!startedAt) return "-";
  return formatDistanceStrict(finishedAt ?? new Date(), startedAt);
};
