"use client";

import { RoleAnalyticsEntity } from "@/sdk";
import { Badge } from "../ui/badge";
import { SENIORITY_COLORS } from "@/consts";
import { mapSeniorityLevel } from "@/utils/mappings";
import clsx from "clsx";
import Link from "next/link";
import { ArrowUpRight, ThumbsUp } from "lucide-react";
import { Button } from "../ui/button";
import { EvaluateClassificationModal } from "./EvaluateClassificationModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useFetchRole } from "@/hooks/role/useFetchRole";

interface Props {
  roleId: string;
  showCompanyInfo?: boolean;
}

export function CareerTimelineItem({ roleId }: Props) {
  const { data: role } = useFetchRole(roleId);
  const { user } = useAuth();
  
  if (!role) return null;
  
  const startDate = new Date(role.startDate);
  const endDate = role.endDate ? new Date(role.endDate) : null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="relative group">
      <div className="flex flex-col gap-2">
        <div>
          <h4 className="text-base font-medium text-foreground group-hover:text-primary transition-colors">
            {role.roleRaw?.title ||
              role.jobClassification?.escoClassification.titleEn}
          </h4>

          {/* Date range */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1.5">
            <span>
              {formatDate(startDate)} -{" "}
              {endDate ? formatDate(endDate) : "Present"}
            </span>
            <span className="w-1 h-1 rounded-full bg-primary/20" />
            <span>
              {role.location?.city}, {role.location?.country}
            </span>
          </div>
        </div>

        {/* ESCO classification */}
        {user &&
          user.id === role.alumniId &&
          role.jobClassification?.escoClassification?.titleEn && (
            <div className="text-sm text-muted-foreground flex items-center gap-1.5">
              <span>In ESCO as</span>
              {role.jobClassification.escoClassification.escoUrl ? (
                <Link
                  href={role.jobClassification.escoClassification.escoUrl}
                  className="font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-0.5"
                  target="_blank"
                >
                  {role.jobClassification.escoClassification.titleEn}
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <span className="font-medium text-primary">
                  {role.jobClassification.escoClassification.titleEn}
                </span>
              )}

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <EvaluateClassificationModal
                      role={role}
                      trigger={
                        <Button
                          variant="ghost"
                          size="sm"
                          className={clsx(
                            "h-6 px-2 text-primary hover:text-primary/80 hover:bg-primary/5",
                          )}
                        >
                          <ThumbsUp size={14} className="mr-1" />
                          Evaluate
                        </Button>
                      }
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    {role.jobClassification?.wasAcceptedByUser ===
                    role.wasSeniorityLevelAcceptedByUser
                      ? "Re-evaluate this classification"
                      : "Help us improve by evaluating this classification"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

        {/* Seniority level */}
        {role.seniorityLevel && (
          <Badge
            className={clsx(
              "w-fit mt-1",
              SENIORITY_COLORS[role.seniorityLevel] ||
                "bg-primary/5 text-primary border-primary/20"
            )}
          >
            {mapSeniorityLevel(role.seniorityLevel)}
          </Badge>
        )}
      </div>
    </div>
  );
}
