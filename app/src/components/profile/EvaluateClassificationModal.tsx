"use client";

import { RoleAnalyticsEntity } from "@/sdk";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  TagIcon,
  Gauge,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import { mapSeniorityLevel } from "@/utils/mappings";
import { useEvaluateClassifcation } from "@/hooks/profile/useEvaluateClassifcation";
import { useEvaluateSeniority } from "@/hooks/profile/useEvaluateSeniority";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { SENIORITY_COLORS } from "@/consts";
import clsx from "clsx";
import Link from "next/link";

interface Props {
  role: RoleAnalyticsEntity;
  trigger?: React.ReactNode;
}

const enum EvaluationStatus {
  NOT_EVALUATED = "not-evaluated",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}

const getEvaluationStatus = (wasAccepted: boolean | undefined) => {
  if (wasAccepted === undefined) {
    return EvaluationStatus.NOT_EVALUATED;
  }
  return wasAccepted ? EvaluationStatus.ACCEPTED : EvaluationStatus.REJECTED;
};

export function EvaluateClassificationModal({ role, trigger }: Props) {
  const [open, setOpen] = useState(false);

  const [classificationEvaluated, setClassificationEvaluated] =
    useState<boolean>(false);
  const [seniorityEvaluated, setSeniorityEvaluated] = useState<boolean>(false);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setClassificationEvaluated(false);
      setSeniorityEvaluated(false);
    }
  };

  const classificationStatus = getEvaluationStatus(
    role.jobClassification?.wasAcceptedByUser
  );

  const seniorityStatus = getEvaluationStatus(
    role.wasSeniorityLevelAcceptedByUser
  );

  const { mutate: evaluateClassification, isPending: classifPending } =
    useEvaluateClassifcation({
      onSuccess: () => {
        setClassificationEvaluated(true);
      },
    });

  const { mutate: evaluateSeniority, isPending: seniorityPending } =
    useEvaluateSeniority({
      onSuccess: () => {
        setSeniorityEvaluated(true);
      },
    });

  const handleClassificationEvaluation = (wasAccepted: boolean) => {
    evaluateClassification({
      id: role.id,
      evaluateClassificationDto: {
        wasAcceptedByUser: wasAccepted,
      },
    });
    setClassificationEvaluated(wasAccepted);
  };

  const handleSeniorityEvaluation = (wasAccepted: boolean) => {
    console.log("wasAccepted", wasAccepted);
    evaluateSeniority({
      id: role.id,
      evaluateSeniorityLevelDto: {
        wasSeniorityLevelAcceptedByUser: wasAccepted,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            className="gap-2 hover:bg-primary/5 hover:border-primary/30"
          >
            <TagIcon className="h-4 w-4" />
            Evaluate Role Classification
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Role Evaluation</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            This classification was generated automatically. Confirming or
            correcting it helps us improve accuracy across the platform.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="rounded-md border p-4 bg-muted/10 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TagIcon className="w-4 h-4 text-primary" />
                  <h4 className="text-base font-semibold text-primary">
                    ESCO Classification
                  </h4>
                </div>
                <Badge
                  variant="outline"
                  className="font-mono flex items-center gap-1"
                >
                  <TagIcon className="w-3 h-3" />
                  {role.jobClassification?.escoClassification?.code || "N/A"}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {role.jobClassification?.escoClassification?.escoUrl ? (
                  <Link
                    href={role.jobClassification.escoClassification.escoUrl}
                    className="font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-0.5"
                    target="_blank"
                  >
                    {role.jobClassification.escoClassification.titleEn}
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <span className="font-medium text-foreground">
                    {role.jobClassification?.escoClassification?.titleEn}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Button
                variant="outline"
                className={cn(
                  "flex-1 gap-2 transition-colors duration-150",
                  classificationStatus === EvaluationStatus.ACCEPTED
                    ? "bg-green-50 text-green-600 border-green-200 ring-2 ring-offset-2 ring-green-300"
                    : "hover:bg-green-50 hover:text-green-600 border-green-200"
                )}
                onClick={() => handleClassificationEvaluation(true)}
                disabled={classifPending}
              >
                <ThumbsUp size={18} />
                {classifPending ? "Saving..." : "Correct"}
              </Button>
              <Button
                variant="outline"
                className={cn(
                  "flex-1 gap-2 transition-colors duration-150",
                  classificationStatus === EvaluationStatus.REJECTED
                    ? "bg-red-50 text-red-600 border-red-200 ring-2 ring-offset-2 ring-red-300"
                    : "hover:bg-red-50 hover:text-red-600 border-red-200"
                )}
                onClick={() => handleClassificationEvaluation(false)}
                disabled={classifPending}
              >
                <ThumbsDown size={18} />
                {classifPending ? "Saving..." : "Incorrect"}
              </Button>
            </div>
            {classificationEvaluated && (
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Thanks for your feedback!
              </p>
            )}
          </div>

          <Separator />

          {/* Seniority Level Section */}
          <div className="rounded-md border p-4 bg-muted/10 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-primary" />
                  <h4 className="text-base font-semibold text-primary">
                    Seniority Level
                  </h4>
                </div>
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Badge
                  className={clsx(
                    "w-fit",
                    SENIORITY_COLORS[role.seniorityLevel] ||
                      "bg-primary/5 text-primary border-primary/20"
                  )}
                >
                  {mapSeniorityLevel(role.seniorityLevel)}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Button
                variant="outline"
                className={cn(
                  "flex-1 gap-2 transition-colors duration-150",
                  seniorityStatus === EvaluationStatus.ACCEPTED
                    ? "bg-green-50 text-green-600 border-green-200 ring-2 ring-offset-2 ring-green-300"
                    : "hover:bg-green-50 hover:text-green-600 border-green-200"
                )}
                onClick={() => handleSeniorityEvaluation(true)}
                disabled={seniorityPending}
              >
                <ThumbsUp size={18} />
                {seniorityPending ? "Saving..." : "Correct"}
              </Button>
              <Button
                variant="outline"
                className={cn(
                  "flex-1 gap-2 transition-colors duration-150",
                  seniorityStatus === EvaluationStatus.REJECTED
                    ? "bg-red-50 text-red-600 border-red-200 ring-2 ring-offset-2 ring-red-300"
                    : "hover:bg-red-50 hover:text-red-600 border-red-200"
                )}
                onClick={() => handleSeniorityEvaluation(false)}
                disabled={seniorityPending}
              >
                <ThumbsDown size={18} />
                {seniorityPending ? "Saving..." : "Incorrect"}
              </Button>
            </div>
            {seniorityEvaluated && (
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Thanks for your feedback!
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => setOpen(false)}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
