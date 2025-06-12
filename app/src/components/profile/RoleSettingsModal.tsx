import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Settings2, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { RoleAnalyticsEntity } from "@/sdk";
import { useSetMainRole } from "@/hooks/profile/useSetMainRole";
import { useUpdateRoleVisibility } from "@/hooks/profile/useUpdateRoleVisibility";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/misc/useToast";

interface RoleSettingsModalProps {
  roles: RoleAnalyticsEntity[];
}

function RoleDisplay({ role }: { role: RoleAnalyticsEntity }) {
  const company = role.company?.name || "No company";
  const title =
    role.roleRaw?.title ||
    role.jobClassification?.escoClassification.titleEn ||
    "No title";
  const start = role.startDate
    ? new Date(role.startDate).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "";
  const end = role.endDate
    ? new Date(role.endDate).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Present";
  const dates = start ? `${start} - ${role.endDate ? end : "Present"}` : "";
  return (
    <div className="flex flex-col">
      <span className="font-medium">
        {company} - {title}
      </span>
      <span className="text-xs text-muted-foreground">{dates}</span>
    </div>
  );
}

export function RoleSettingsModal({ roles }: RoleSettingsModalProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const { setMainRole, isPending: isSettingMainRole } = useSetMainRole({
    onSuccess: () => {
      toast({
        title: "Main role updated",
        variant: "success",
        description: "The main role has been updated",
        duration: 2000,
      });
      setOpen(false);
    },
  });

  const { mutate: updateRoleVisibility, isPending: isUpdatingVisibility } =
    useUpdateRoleVisibility({
      onSuccess: () => {
        toast({
          title: "Role visibility updated",
          variant: "success",
          description: "The role visibility has been updated",
          duration: 2000,
        });
      },
    });

  const mainRole = roles.find((role) => role.isMainRole);

  const handleMainRoleChange = (roleId: string) => {
    setMainRole({ id: roleId });
  };

  const handleRoleVisibilityChange = (roleId: string, shouldHide: boolean) => {
    updateRoleVisibility({
      updateRoleVisibilityDto: {
        id: roleId,
        shouldHide,
      },
    });
  };

  const possibleMainRoles = roles.filter(
    (role) => role.isCurrent && !role.isHiddenInProfile
  );

  const visibleRoleIds = roles
    .filter((role) => !role.isHiddenInProfile)
    .map((role) => role.id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="h-4 w-4" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Role Settings</DialogTitle>
          <DialogDescription>
            Manage your main role and role visibility settings.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <label className="text-sm font-medium">Main Role</label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <HelpCircle className="w-4 h-4 text-muted-foreground cursor-pointer" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    This is the main role that will be highlighted on your
                    profile.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select
              value={mainRole?.id}
              onValueChange={handleMainRoleChange}
              disabled={isSettingMainRole}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select main role" />
              </SelectTrigger>
              <SelectContent>
                {possibleMainRoles
                  .sort(
                    (a, b) => b.startDate?.getTime() - a.startDate?.getTime()
                  )
                  .map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <RoleDisplay role={role} />
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <label className="text-sm font-medium">Visible Roles</label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <HelpCircle className="w-4 h-4 text-muted-foreground cursor-pointer" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    Only the roles you select here will be shown on your public
                    profile.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                  disabled={isUpdatingVisibility}
                >
                  {visibleRoleIds.length} roles selected
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandEmpty>No roles found.</CommandEmpty>
                  <CommandGroup>
                    {roles.map((role) => (
                      <CommandItem
                        key={role.id}
                        value={role.id}
                        disabled={role.isMainRole}
                        onSelect={() => {
                          const isSelected = visibleRoleIds.includes(role.id);
                          if (isSelected) {
                            handleRoleVisibilityChange(role.id, true);
                          } else {
                            handleRoleVisibilityChange(role.id, false);
                          }
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            visibleRoleIds.includes(role.id)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <RoleDisplay role={role} />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
