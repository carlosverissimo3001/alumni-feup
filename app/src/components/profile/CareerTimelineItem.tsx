"use client";

import { Badge } from "../ui/badge";
import { SENIORITY_COLORS } from "@/consts";
import { mapSeniorityLevel } from "@/utils/mappings";
import clsx from "clsx";
import Link from "next/link";
import {
  ArrowUpRight,
  ThumbsUp,
  GaugeCircle,
  TagIcon,
  PencilIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import { EvaluateClassificationModal } from "./EvaluateClassificationModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useFetchRole } from "@/hooks/role/useFetchRole";
import { UpdateSeniorityModal } from "./UpdateSeniorityModal";
import { UpdateClassificationModal } from "./UpdateClassificationModal";
import { useState } from "react";

interface Props {
  roleId: string;
  showCompanyInfo?: boolean;
}

export function CareerTimelineItem({ roleId }: Props) {
  const { data: role } = useFetchRole({ id: roleId });
  const { user } = useAuth();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
        <div className="flex items-center justify-between">
          <h4 className="text-base font-medium text-foreground group-hover:text-primary transition-colors">
            {role.roleRaw?.title ||
              role.jobClassification?.escoClassification.titleEn}
          </h4>

          <div className="flex items-center gap-1">
            {user && user.id === role.alumniId && (
              <>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative">
                        <EvaluateClassificationModal
                          role={role}
                          trigger={
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                            >
                              <ThumbsUp className="h-4 w-4" />
                              <span className="text-sm">Evaluate</span>
                            </Button>
                          }
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={5} className="z-50">
                      Evaluate classification accuracy
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider delayDuration={100}>
                  <Tooltip
                    open={tooltipOpen && !dropdownOpen}
                    onOpenChange={(open) => {
                      if (!dropdownOpen) {
                        setTooltipOpen(open);
                      }
                    }}
                  >
                    <TooltipTrigger asChild>
                      <div className="relative">
                        <DropdownMenu
                          open={dropdownOpen}
                          onOpenChange={(open) => {
                            setDropdownOpen(open);
                            if (open) {
                              setTooltipOpen(false);
                            }
                          }}
                        >
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                            >
                              <PencilIcon className="h-4 w-4" />
                              <span className="text-sm">Edit</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-[220px]"
                          >
                            <UpdateClassificationModal
                              roleId={roleId}
                              trigger={
                                <DropdownMenuItem
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    setTooltipOpen(false);
                                  }}
                                  className="gap-2 py-2 cursor-pointer"
                                >
                                  <TagIcon className="h-4 w-4 text-amber-500" />
                                  <div className="flex flex-col gap-0.5">
                                    <span>Update Classification</span>
                                    <span className="text-xs text-muted-foreground">
                                      Refine your ESCO classification
                                    </span>
                                  </div>
                                </DropdownMenuItem>
                              }
                            />
                            <UpdateSeniorityModal
                              roleId={roleId}
                              trigger={
                                <DropdownMenuItem
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    setTooltipOpen(false);
                                  }}
                                  className="gap-2 py-2 cursor-pointer"
                                >
                                  <GaugeCircle className="h-4 w-4 text-amber-500" />
                                  <div className="flex flex-col gap-0.5">
                                    <span>Update Seniority Level</span>
                                    <span className="text-xs text-muted-foreground">
                                      Change your role&apos;s seniority
                                    </span>
                                  </div>
                                </DropdownMenuItem>
                              }
                            />
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={5} className="z-50">
                      Update role details
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}
          </div>
        </div>

        {/* Date range */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1.5">
          <span>
            {formatDate(startDate)} -{" "}
            {endDate ? formatDate(endDate) : "Present"}
          </span>
          <span className="w-1 h-1 rounded-full bg-primary/20" />
          {role.location?.city && role.location?.country && (
            <span>
              {role.location?.city}, {role.location?.country}
            </span>
          )}
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
