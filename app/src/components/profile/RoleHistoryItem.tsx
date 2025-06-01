"use client";

import {
  ArrowUpRight,
  Clock,
  MapPin,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { mapSeniorityLevel } from "@/utils/mappings";
import { RoleAnalyticsEntity } from "@/sdk";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useEvaluateClassifcation } from "@/hooks/profile/useEvaluateClassifcation";
import { useEvaluateSeniority } from "@/hooks/profile/useEvalutateSeniority";
import { SENIORITY_COLORS } from "@/consts";

interface Props {
  role: RoleAnalyticsEntity;
}

export function RoleItem({ role }: Props) {
  const {
    mutate: evaluateClassification,
    isPending: classifPending,
  } = useEvaluateClassifcation({ roleId: role.id });

  const {
    mutate: evaluateSeniority,
    isPending: seniorityPending,
  } = useEvaluateSeniority({ roleId: role.id });

  return (
    <div className="relative flex gap-6 items-start group">
      {/* Timeline dot */}
      <div className="absolute -left-4 top-2.5 z-10">
        <span className="block w-4 h-4 rounded-full bg-primary border-2 border-white shadow-md group-hover:scale-110 transition-transform" />
      </div>

      {/* Company logo */}
      <div className="w-12 h-12 rounded-full bg-white border border-muted-foreground/10 flex items-center justify-center overflow-hidden shadow-sm">
        {role.company?.logo ? (
          <Image
            src={role.company.logo}
            alt={role.company.name || ""}
            width={48}
            height={48}
            className="object-contain w-10 h-10"
          />
        ) : (
          <span className="text-lg font-bold text-muted-foreground">
            {role.company?.name?.[0] || "?"}
          </span>
        )}
      </div>

      {/* Details */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-lg font-semibold">
            {role.roleRaw?.title || role.jobClassification?.escoClassification?.titleEn || "No title"}
          </div>
          {role.seniorityLevel && (
            <span
              className={clsx(
                "px-2 py-0.5 rounded-full border text-xs font-medium ml-1",
                SENIORITY_COLORS[role.seniorityLevel] || "bg-gray-100 text-gray-800 border-gray-200"
              )}
            >
              {mapSeniorityLevel(role.seniorityLevel)}
            </span>
          )}
        </div>

        {/* ESCO classification */}
        {role.jobClassification?.escoClassification?.titleEn && (
          <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
            <span>In ESCO as</span>
            {role.jobClassification.escoClassification.escoUrl ? (
              <Link
                href={role.jobClassification.escoClassification.escoUrl}
                className="font-medium underline hover:text-primary transition-colors flex items-center gap-0.5"
                target="_blank"
              >
                {role.jobClassification.escoClassification.titleEn}
                <ArrowUpRight className="w-3.5 h-3.5 ml-0.5 inline-block" />
              </Link>
            ) : (
              <span className="font-medium">{role.jobClassification.escoClassification.titleEn}</span>
            )}
          </div>
        )}

        {/* Feedback buttons */}
        <div className="flex items-center gap-4 mt-1 mb-2">
          <div className="text-xs text-muted-foreground">
            You&apos;re evaluating the automatic ESCO classification for this role.
          </div>
          <TooltipProvider>
            {/* ESCO */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="link"
                  onClick={() => evaluateClassification({ wasAcceptedByUser: true })}
                  disabled={classifPending}
                  className="hover:text-green-600"
                >
                  <ThumbsUp size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Is this ESCO classification correct?</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="link"
                  onClick={() => evaluateClassification({ wasAcceptedByUser: false })}
                  disabled={classifPending}
                  className="hover:text-red-600"
                >
                  <ThumbsDown size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>No, this ESCO classification is not correct</TooltipContent>
            </Tooltip>

            {/* Seniority */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="link"
                  onClick={() => evaluateSeniority({ wasSeniorityLevelAcceptedByUser: true })}
                  disabled={seniorityPending}
                  className="hover:text-green-600"
                >
                  <ThumbsUp size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Is this seniority level correct?</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="link"
                  onClick={() => evaluateSeniority({ wasSeniorityLevelAcceptedByUser: false })}
                  disabled={seniorityPending}
                  className="hover:text-red-600"
                >
                  <ThumbsDown size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>No, this seniority level is not correct</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Time and Location */}
        <div className="flex items-center text-sm text-muted-foreground mb-1">
          <Clock className="h-3.5 w-3.5 mr-1.5 opacity-70" />
          {role.startDate
            ? new Date(role.startDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })
            : ""}
          {role.endDate
            ? ` to ${new Date(role.endDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })}`
            : " - Present"}
        </div>

        <div className="flex items-center gap-2 mt-2">
          <Link
            href={`/company/${role.company?.id}`}
            className="text-base font-semibold hover:text-primary transition-colors group flex items-center gap-1"
          >
            {role.company?.name || "No company specified"}
            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          {role.company?.industry && (
            <span className="flex items-center text-xs text-muted-foreground ml-2">
              <span className="inline-block w-2 h-2 rounded-full bg-zinc-400 mr-1"></span>
              {role.company.industry.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          {role.location?.city && role.location?.country
            ? `${role.location.city}, ${role.location.country}`
            : "Location not specified"}
          {role.location?.countryCode && (
            <Image
              src={`https://flagcdn.com/${role.location.countryCode.toLowerCase()}.svg`}
              alt={role.location.country || ""}
              className="w-8 h-5 rounded shadow-sm ml-2"
              width={32}
              height={20}
            />
          )}
        </div>
      </div>
    </div>
  );
}
