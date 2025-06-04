import {
  Dialog,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { TagIcon } from "lucide-react";
import { Gauge, BrainCircuit, Bot, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Combobox } from "../ui/combobox";
import { useState } from "react";
import { useFetchRole } from "@/hooks/role/useFetchRole";
import { useRoleOptions } from "@/hooks/analytics/useRoleOptions";
import { useUpdateClassification } from "@/hooks/profile/useUpdateClassification";
import { useToast } from "@/hooks/misc/useToast";

interface Props {
  roleId: string;
  trigger?: React.ReactNode;
}

function ReasoningSection({ reasoning }: { reasoning: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 150;
  const shouldTruncate = reasoning.length > maxLength;
  const displayText =
    shouldTruncate && !isExpanded
      ? reasoning.slice(0, maxLength) + "..."
      : reasoning;

  return (
    <div className="rounded border border-amber-200/50 bg-white/50 p-3">
      <div className="space-y-2">
        <p className="text-xs text-amber-800">
          <span className="font-medium">Reasoning:</span> {displayText}
        </p>
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            {isExpanded ? (
              <>
                Show less <ChevronUp className="h-3 w-3" />
              </>
            ) : (
              <>
                Show more <ChevronDown className="h-3 w-3" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export function UpdateClassificationModal({ roleId, trigger }: Props) {
  // State
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  // Mutations
  const { mutate: updateClassification, isPending } = useUpdateClassification({
    onSuccess: () => {
      toast({
        title: "Classification updated",
        variant: "success",
        description: "Your job classification has been updated",
      });
      setOpen(false);
    },
  });

  // Hooks
  const { data: role } = useFetchRole({ id: roleId, includeMetadata: true });
  const { data: escoOptionsData } = useRoleOptions({ enabled: open });
  const [selectedEsco, setSelectedEsco] = useState<string | null>(
    role?.jobClassification?.escoClassificationId || null
  );

  if (!role) return null;

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Reset selection when closing
      setSelectedEsco(role?.jobClassification?.escoClassificationId || null);
    }
  };

  const handleUpdateClassification = () => {
    if (!selectedEsco) return;
    updateClassification({
      id: roleId,
      updateClassificationDto: { escoClassificationId: selectedEsco },
    });
  };

  const escoOptions = escoOptionsData?.map((option) => ({
    label: option.title,
    value: option.escoClassificationId,
  }));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            className="w-full shadow-md hover:shadow-lg transition-all"
            size="lg"
            variant="outline"
          >
            <TagIcon className="mr-2 h-4 w-4" />
            Update Job Classification
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <TagIcon className="h-5 w-5 text-amber-500" />
            Update Your Job Classification
          </DialogTitle>
          <DialogDescription>
            ESCO is the European multilingual classification of Skills,
            Competences, Qualifications and Occupations. Our AI has classified
            your role, but you can refine it below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-amber-500" />
                <p className="text-sm font-medium">Current Classification</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <p className="font-semibold">
                {role?.jobClassification?.escoClassification.titleEn ||
                  "Unknown"}
              </p>
              <Badge
                variant="outline"
                className="bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200"
              >
                {role?.jobClassification?.escoClassification?.code ||
                  "Not Classified"}
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Confidence</p>
                <span className="text-xs font-medium">
                  {Math.round(
                    (role.jobClassification?.confidence as number) * 100
                  )}
                  %
                </span>
              </div>
              <Progress
                value={(role.jobClassification?.confidence as number) * 100}
                className="h-2"
              />
              <div className="flex justify-between text-xs mt-1">
                <span
                  className={
                    (role.jobClassification?.confidence as number) < 0.6
                      ? "font-medium text-red-500"
                      : "text-muted-foreground"
                  }
                >
                  Low
                </span>
                <span
                  className={
                    (role.jobClassification?.confidence as number) >= 0.6 &&
                    (role.jobClassification?.confidence as number) <= 0.8
                      ? "font-medium text-amber-500"
                      : "text-muted-foreground"
                  }
                >
                  Medium
                </span>
                <span
                  className={
                    (role.jobClassification?.confidence as number) > 0.8
                      ? "font-medium text-green-500"
                      : "text-muted-foreground"
                  }
                >
                  High
                </span>
              </div>
            </div>
          </div>

          {role.jobClassification?.metadata && (
            <div className="space-y-3 rounded-lg border border-amber-200/50 bg-amber-50/30 p-4">
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-amber-600" />
                <p className="text-sm font-medium text-amber-900">
                  AI Classification Details
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-amber-500" />
                  <span className="text-xs text-amber-700">
                    Classified by {role.jobClassification.modelUsed}
                  </span>
                </div>

                {role.jobClassification.metadata.choices && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-amber-800">
                      Alternative Classifications:
                    </p>
                    {role.jobClassification.metadata.choices
                      .slice(1)
                      .map((choice) => (
                        <div
                          key={choice.id}
                          className="flex items-center justify-between rounded border border-amber-200/50 bg-white/50 px-3 py-2"
                        >
                          <span className="text-xs text-amber-800">
                            {choice.title}
                          </span>
                          <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200"
                          >
                            {Math.round((choice.confidence || 0) * 100)}%
                          </Badge>
                        </div>
                      ))}
                  </div>
                )}

                {role.jobClassification.metadata.reasoning && (
                  <ReasoningSection
                    reasoning={role.jobClassification.metadata.reasoning}
                  />
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Select the specific job classification that best represents your
              role:
            </p>
            <Combobox
              options={escoOptions || []}
              value={selectedEsco}
              onChange={setSelectedEsco}
              placeholder="Select classification..."
              searchPlaceholder="Search classifications..."
              emptyMessage="No classifications found."
              className="border-amber-200 focus-within:border-amber-500"
              maxDisplayCount={30}
              isLoading={!escoOptions?.length}
            />
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateClassification}
            className="w-full sm:w-auto"
            disabled={
              !selectedEsco ||
              selectedEsco === role.jobClassification?.escoClassificationId ||
              isPending
            }
          >
            {isPending ? "Updating..." : "Update Classification"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
