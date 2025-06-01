import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Briefcase,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { RoleAnalyticsEntity } from "@/sdk";
import clsx from "clsx";
import { Button } from "../ui/button";
import { RoleItem } from "./RoleHistoryItem";

interface RoleHistoryProps {
  roles: RoleAnalyticsEntity[];
}

export default function RoleHistory({ roles }: RoleHistoryProps) {
  const [open, setOpen] = useState(false);
  if (!roles?.length) return null;

  // Sort roles by startDate descending
  const sortedRoles = [...roles].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  return (
    <Card className="mb-4 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="py-2 flex flex-row items-center justify-between">
        <CardTitle className="text-xl flex items-center">
          <Briefcase className="mr-2 h-5 w-5 text-primary" />
          Role History
        </CardTitle>
        <Button
          variant="link"
          className="text-primary underline text-sm flex items-center gap-1 select-none"
          onClick={() => setOpen((open) => !open)}
        >
          <span>{open ? "Hide" : "Show"}</span>
          <ChevronDown
            className={clsx(
              "transition-transform duration-300",
              open ? "rotate-180" : "rotate-0"
            )}
            size={18}
          />
        </Button>
      </CardHeader>
      <div
        className={clsx(
          "overflow-hidden transition-all duration-500",
          open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <CardContent className="pt-3">
          <div className="relative flex flex-col gap-8 pl-6">
            {/* Timeline vertical line */}
            <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-muted-foreground/20" />
            {sortedRoles.map((role) => (
              <RoleItem key={role.id} role={role} />
            ))}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
