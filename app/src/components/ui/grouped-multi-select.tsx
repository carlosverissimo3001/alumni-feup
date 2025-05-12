import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  CheckIcon,
  XCircle,
  ChevronDown,
  XIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

const multiSelectVariants = cva(
  "m-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300",
  {
    variants: {
      variant: {
        default:
          "border-foreground/10 text-foreground bg-card hover:bg-card/80",
        secondary:
          "border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        inverted: "inverted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface GroupedOption {
  id: string;
  name: string;
  group: string;
}

interface GroupedMultiSelectProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof multiSelectVariants> {
  options: GroupedOption[];
  onValueChange: (value: string[]) => void;
  defaultValue?: string[];
  value?: string[];
  placeholder?: string;
  maxCount?: number;
  modalPopover?: boolean;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export const GroupedMultiSelect = React.forwardRef<
  HTMLButtonElement,
  GroupedMultiSelectProps
>(
  (
    {
      options,
      onValueChange,
      variant,
      defaultValue = [],
      value,
      placeholder = "Select options",
      maxCount = 3,
      modalPopover = false,
      className,
      disabled = false,
      isLoading = false,
      ...props
    },
    ref
  ) => {
    // Internal state for selected values
    const [internalSelectedValues, setInternalSelectedValues] = 
      React.useState<string[]>(defaultValue);
      
    const [searchValue, setSearchValue] = React.useState("");
    
    // Use the value prop if provided (controlled), otherwise use internal state
    const selectedValues = value !== undefined ? value : internalSelectedValues;
    
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

    // Group options by their group property
    const groupedOptions = React.useMemo(() => {
      const groups: Record<string, GroupedOption[]> = {};
      
      options.forEach(option => {
        if (!groups[option.group]) {
          groups[option.group] = [];
        }
        groups[option.group].push(option);
      });
      
      return groups;
    }, [options]);

    React.useEffect(() => {
      if (value !== undefined) {
        setInternalSelectedValues(value);
      }
    }, [value]);


    const toggleOption = (optionId: string) => {
      const newSelectedValues = selectedValues.includes(optionId)
        ? selectedValues.filter((id) => id !== optionId)
        : [...selectedValues, optionId];
      
      setInternalSelectedValues(newSelectedValues);
      onValueChange(newSelectedValues);
    };

    const handleClear = () => {
      setInternalSelectedValues([]);
      onValueChange([]);
    };

    const handleTogglePopover = () => {
      if (!disabled) {
        setIsPopoverOpen((prev) => !prev);
      }
    };

    const toggleGroup = (group: string) => {
      const groupOptionIds = options
        .filter(option => option.group === group)
        .map(option => option.id);
      
      const allSelected = groupOptionIds.every(id => selectedValues.includes(id));
      
      let newSelectedValues: string[];
      
      if (allSelected) {
        // If all are selected, unselect all from this group
        newSelectedValues = selectedValues.filter(
          id => !groupOptionIds.includes(id)
        );
      } else {
        // Otherwise, select all from this group
        const valuesToAdd = groupOptionIds.filter(
          id => !selectedValues.includes(id)
        );
        newSelectedValues = [...selectedValues, ...valuesToAdd];
      }
      
      setInternalSelectedValues(newSelectedValues);
      onValueChange(newSelectedValues);
    };

    // Find option by ID
    const getOptionById = (id: string) => {
      return options.find(option => option.id === id);
    };

    // Filter options based on search
    const filteredGroups = React.useMemo(() => {
      if (!searchValue) return groupedOptions;
      
      const filtered: Record<string, GroupedOption[]> = {};
      
      Object.entries(groupedOptions).forEach(([group, groupOptions]) => {
        const filteredOptions = groupOptions.filter(option => 
          option.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          group.toLowerCase().includes(searchValue.toLowerCase())
        );
        
        if (filteredOptions.length > 0) {
          filtered[group] = filteredOptions;
        }
      });
      
      return filtered;
    }, [groupedOptions, searchValue]);

    return (
      <Popover
        open={isPopoverOpen}
        onOpenChange={disabled ? undefined : setIsPopoverOpen}
        modal={modalPopover}
      >
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            {...props}
            onClick={handleTogglePopover}
            disabled={disabled}
            className={cn(
              "flex w-full p-1 rounded-md border min-h-10 h-auto items-center justify-between bg-inherit hover:bg-inherit [&_svg]:pointer-events-auto",
              disabled ? "opacity-50 cursor-not-allowed" : "",
              className
            )}
          >
            {selectedValues.length > 0 ? (
              <div className="flex justify-between items-center w-full">
                <div className="flex flex-wrap items-center">
                  {selectedValues.slice(0, maxCount).map((id) => {
                    const option = getOptionById(id);
                    return option ? (
                      <Badge
                        key={id}
                        className={cn(multiSelectVariants({ variant }))}
                      >
                        {option.name}
                        <XCircle
                          className="ml-2 h-4 w-4 cursor-pointer"
                          onClick={(event) => {
                            event.stopPropagation();
                            if (!disabled) toggleOption(id);
                          }}
                        />
                      </Badge>
                    ) : null;
                  })}
                  {selectedValues.length > maxCount && (
                    <Badge
                      className={cn(
                        "bg-transparent text-foreground border-foreground/1 hover:bg-transparent",
                        multiSelectVariants({ variant })
                      )}
                    >
                      {`+ ${selectedValues.length - maxCount} more`}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <XIcon
                    className="h-4 mx-2 cursor-pointer text-muted-foreground"
                    onClick={(event) => {
                      event.stopPropagation();
                      if (!disabled) handleClear();
                    }}
                  />
                  <Separator
                    orientation="vertical"
                    className="flex min-h-6 h-full"
                  />
                  <ChevronDown className="h-4 mx-2 cursor-pointer text-muted-foreground" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full mx-auto">
                <span className="text-sm text-muted-foreground mx-3">
                  {placeholder}
                </span>
                <ChevronDown className="h-4 cursor-pointer text-muted-foreground mx-2" />
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] min-w-[200px] p-0"
          align="start"
          onEscapeKeyDown={() => setIsPopoverOpen(false)}
        >
          <Command>
            <CommandInput
              placeholder="Search..."
              onValueChange={setSearchValue}
              value={searchValue}
              className="h-9"
            />
            <CommandList>
              <CommandEmpty className="p-2">
                {isLoading ? "Loading..." : "No results found."}
              </CommandEmpty>
              {Object.entries(filteredGroups).map(([group, groupOptions]) => {
                // Determine if we have more than one country group
                const hasMultipleGroups = Object.keys(filteredGroups).length > 1;
                
                return (
                <CommandGroup 
                  key={group} 
                  className="px-1 py-0.5"
                  heading={hasMultipleGroups ? 
                    <div className="flex items-center gap-4 justify-start w-full pr-2 py-1">
                      <span className="text-sm text-foreground">{group}</span>
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary transition-colors",
                          groupOptions.every(option => 
                            selectedValues.includes(option.id)
                          )
                            ? "bg-primary text-primary-foreground"
                            : "opacity-70 hover:opacity-100 [&_svg]:invisible hover:bg-primary/10"
                        )}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleGroup(group);
                        }}
                        title={`Select all ${group} cities`}
                      >
                        <CheckIcon className="h-4 w-4" />
                      </div>
                    </div>
                  : undefined}
                >
                  {groupOptions.sort((a, b) => a.name.localeCompare(b.name)).map((option) => (
                    <CommandItem
                      key={option.id}
                      onSelect={() => toggleOption(option.id)}
                      className={cn(
                        "cursor-pointer py-1.5 text-sm",
                        hasMultipleGroups ? "pl-6" : "pl-2"
                      )}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary transition-colors",
                          selectedValues.includes(option.id)
                            ? "bg-primary text-primary-foreground"
                            : "opacity-70 hover:opacity-100 hover:bg-primary/10 [&_svg]:invisible"
                        )}
                      >
                        <CheckIcon className="h-4 w-4" />
                      </div>
                      <span className="text-foreground">{option.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )})}
              <CommandSeparator />
              <CommandGroup>
                <div className="flex items-center justify-between">
                  {selectedValues.length > 0 && (
                    <CommandItem
                      onSelect={handleClear}
                      className="flex-1 justify-center cursor-pointer"
                      disabled={disabled}
                    >
                      Clear
                    </CommandItem>
                  )}
                </div>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

GroupedMultiSelect.displayName = "GroupedMultiSelect"; 
