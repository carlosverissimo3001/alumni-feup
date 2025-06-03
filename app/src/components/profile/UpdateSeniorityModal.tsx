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
import { Gauge } from "lucide-react";
import { Badge } from "../ui/badge";
import { Combobox } from "../ui/combobox";
import { useState } from "react";
import { useFetchRole } from "@/hooks/role/useFetchRole";
import { SENIORITY_COLORS } from "@/consts";
import { mapSeniorityLevel } from "@/utils/mappings";
import { RoleAnalyticsControllerGetSeniorityLevelsSeniorityLevelEnum as SeniorityLevelEnum } from "@/sdk";
import clsx from "clsx";
import { SENIORITY_LEVEL_API_TO_ENUM } from "@/types/roles";
import { useToast } from "@/hooks/misc/useToast";
import { useUpdateSeniority } from "@/hooks/profile/useUpdateSeniority";

interface Props {
  roleId: string;
  trigger?: React.ReactNode;
}

export function UpdateSeniorityModal({ roleId, trigger }: Props) {
  // State
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  // Mutations
  const { mutate: updateSeniority, isPending } = useUpdateSeniority({
    onSuccess: () => {
      toast({
        title: "Seniority level updated",
        variant: "success",
        description: "Your seniority level has been updated",
      });
      setOpen(false);
    },
  });

  // Hooks
  const { data: role } = useFetchRole(roleId);
  const [selectedSeniorityLevel, setSelectedSeniorityLevel] =
    useState<SeniorityLevelEnum | null>(role?.seniorityLevel || null);

  if (!role) return null;

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSelectedSeniorityLevel(role?.seniorityLevel || null);
    }
  };

  const seniorityLevels = Object.values(SeniorityLevelEnum).map((value) => ({
    value: value,
    label: SENIORITY_LEVEL_API_TO_ENUM[value],
  }));

  const handleUpdateSeniority = () => {
    if (!selectedSeniorityLevel) return;
    updateSeniority({
      id: roleId,
      updateSeniorityLevelDto: {
        seniorityLevel: selectedSeniorityLevel,
      },
    });
  };

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
            Update Seniority Level
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <TagIcon className="h-5 w-5 text-amber-500" />
            Update Your Seniority Level
          </DialogTitle>
          <DialogDescription>
            Our AI has classified your role, but you can refine it below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-amber-500" />
                <p className="text-sm font-medium">Current Seniority Level</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
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

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Select the specific seniority level that best represents your
              role:
            </p>
            <Combobox
              options={seniorityLevels || []}
              value={selectedSeniorityLevel}
              onChange={(value) =>
                setSelectedSeniorityLevel(value as SeniorityLevelEnum)
              }
              placeholder="Select seniority level..."
              searchPlaceholder="Search classifications..."
              emptyMessage="No classifications found."
              className="border-amber-200 focus-within:border-amber-500"
              popoverWidth="w-[calc(100vw-2rem)] sm:w-[568px]"
              maxDisplayCount={30}
              isLoading={!seniorityLevels?.length}
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
            onClick={handleUpdateSeniority}
            className="w-full sm:w-auto"
            disabled={
              !selectedSeniorityLevel ||
              selectedSeniorityLevel === role.seniorityLevel ||
              isPending
            }
          >
            {isPending ? "Updating..." : "Update Seniority"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
