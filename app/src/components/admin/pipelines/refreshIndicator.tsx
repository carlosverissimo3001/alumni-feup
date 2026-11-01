"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RefreshIndicatorProps = {
  intervalMs: number;
  onRefresh: () => void;
  isRefreshing?: boolean;
  className?: string;
};

// Countdown is purely visual - it mirrors the refetchInterval the caller is
// already polling at, it doesn't drive it. Resets on every tick and on
// manual refresh so it never drifts far from the real poll.
export function RefreshIndicator({
  intervalMs,
  onRefresh,
  isRefreshing,
  className,
}: RefreshIndicatorProps) {
  const totalSeconds = Math.max(1, Math.round(intervalMs / 1000));
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

  useEffect(() => {
    setSecondsLeft(totalSeconds);
    const id = setInterval(() => {
      setSecondsLeft((current) => (current <= 1 ? totalSeconds : current - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [totalSeconds]);

  const handleRefresh = () => {
    setSecondsLeft(totalSeconds);
    onRefresh();
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm text-muted-foreground",
        className
      )}
    >
      <span>Refreshing in {secondsLeft}s</span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-xs text-muted-foreground"
        onClick={handleRefresh}
        disabled={isRefreshing}
      >
        <RefreshCw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
        Refresh now
      </Button>
    </div>
  );
}
