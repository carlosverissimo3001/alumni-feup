import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  CheckIcon,
  XCircle,
  ChevronDown,
  XIcon,
  WandSparkles,
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
import { useDropdownContext } from "@/contexts/DropdownContext";


/**
 * Variants for the multi-select component to handle different styles.
 * Uses class-variance-authority (cva) to define different styles based on "variant" prop.
 */
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

/**
 * Props for MultiSelect component
 */
interface MultiSelectProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof multiSelectVariants> {
  /**
   * An array of option objects to be displayed in the multi-select component.
   * Each option object has a label, value, and an optional icon.
   */
  options: {
    /** The text to display for the option. */
    label: string;
    /** The unique value associated with the option. */
    value: string;
    /** Optional icon component to display alongside the option. */
    icon?: React.ComponentType<{ className?: string }>;
  }[];

  /**
   * Callback function triggered when the selected values change.
   * Receives an array of the new selected values.
   */
  onValueChange: (value: string[]) => void;

  /** The default selected values when the component first mounts. */
  defaultValue?: string[];

  /** The current selected values (controlled component). */
  value?: string[];

  /**
   * Placeholder text to be displayed when no values are selected.
   * Optional, defaults to "Select options".
   */
  placeholder?: string;

  /**
   * Animation duration in seconds for the visual effects (e.g., bouncing badges).
   * Optional, defaults to 0 (no animation).
   */
  animation?: number;

  /**
   * Maximum number of items to display. Extra selected items will be summarized.
   * Optional, defaults to 3.
   */
  maxCount?: number;

  /**
   * The modality of the popover. When set to true, interaction with outside elements
   * will be disabled and only popover content will be visible to screen readers.
   * Optional, defaults to false.
   */
  modalPopover?: boolean;

  /**
   * If true, renders the multi-select component as a child of another component.
   * Optional, defaults to false.
   */
  asChild?: boolean;

  /**
   * Additional class names to apply custom styles to the multi-select component.
   * Optional, can be used to add custom styles.
   */
  className?: string;

  /**
   * Whether the component is disabled.
   * Optional, defaults to false.
   */
  disabled?: boolean;

  /**
   * Whether to allow selecting all options.
   * Optional, defaults to false.
   */
  allowSelectAll?: boolean;
  onSearchChange?: (search: string) => void;
  isLoading?: boolean;

  /**
   * If true, will only fetch options after the user has typed 3 characters.
   * Optional, defaults to false.
   */
  lazyLoading?: boolean;

  /**
   * Maximum number of options to display in the dropdown.
   * Optional, defaults to 50.
   */
  maxDisplayCount?: number;
}

export const MultiSelect = React.forwardRef<
  HTMLButtonElement,
  MultiSelectProps
>(
  (
    {
      options,
      onValueChange,
      variant,
      defaultValue = [],
      value,
      placeholder = "Select options",
      animation = 0,
      maxCount = 2,
      modalPopover = false,
      allowSelectAll = false,
      className,
      disabled = false,
      isLoading = false,
      onSearchChange,
      lazyLoading = false,
      maxDisplayCount = 50,
      ...props
    },
    ref
  ) => {
    const { setIsAnyOpen } = useDropdownContext();


    // Internal state for selected values when uncontrolled
    const [internalSelectedValues, setInternalSelectedValues] =
      React.useState<string[]>(defaultValue);

    const [searchValue, setSearchValue] = React.useState("");
    // Use the value prop if provided (controlled), otherwise use internal state
    const selectedValues = value !== undefined ? value : internalSelectedValues;

    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
    const [isAnimating, setIsAnimating] = React.useState(false);

    // Effect to sync internal state with external value changes
    React.useEffect(() => {
      if (value !== undefined) {
        setInternalSelectedValues(value);
      }
    }, [value]);

    const handleInputKeyDown = (
      event: React.KeyboardEvent<HTMLInputElement>
    ) => {
      if (event.key === "Enter") {
        setIsPopoverOpen(true);
      } else if (event.key === "Backspace" && !event.currentTarget.value) {
        const newSelectedValues = [...selectedValues];
        newSelectedValues.pop();
        setInternalSelectedValues(newSelectedValues);
        onValueChange(newSelectedValues);
      }
    };

    const toggleOption = (option: string) => {
      const newSelectedValues = selectedValues.includes(option)
        ? selectedValues.filter((value) => value !== option)
        : [...selectedValues, option];
      setInternalSelectedValues(newSelectedValues);
      onValueChange(newSelectedValues);
    };

    const handleClear = () => {
      setInternalSelectedValues([]);
      onValueChange([]);
    };

    const handleTogglePopover = () => {
      if (!disabled) {
        setIsAnyOpen(true);
        setIsPopoverOpen((prev) => !prev);
      }
    };

    const clearExtraOptions = () => {
      const newSelectedValues = selectedValues.slice(0, maxCount);
      setInternalSelectedValues(newSelectedValues);
      onValueChange(newSelectedValues);
    };

    const toggleAll = () => {
      if (selectedValues.length === options.length) {
        handleClear();
      } else {
        const allValues = options.map((option) => option.value);
        setInternalSelectedValues(allValues);
        onValueChange(allValues);
      }
    };

    const filteredOptions = React.useMemo(() => {
      if (!searchValue.trim()) {
        return options;
      }

      const searchTerms = searchValue
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);

      return options.filter((option) => {
        const optionText = option.label.toLowerCase();
        return searchTerms.every((term) => optionText.includes(term));
      });
    }, [options, searchValue]);

    const displayOptions = React.useMemo(() => {
      return filteredOptions.slice(0, maxDisplayCount);
    }, [filteredOptions, maxDisplayCount]);

    const totalFilteredCount = filteredOptions.length;

    const handleSearchChange = (value: string) => {
      setSearchValue(value);
      onSearchChange?.(value);
    };

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
                  {selectedValues.slice(0, maxCount).map((value) => {
                    const option = options.find((o) => o.value === value);
                    const IconComponent = option?.icon;
                    return (
                      <Badge
                        key={value}
                        className={cn(
                          isAnimating ? "animate-bounce" : "",
                          multiSelectVariants({ variant }),
                          "max-w-[200px]"
                        )}
                        style={{ animationDuration: `${animation}s` }}
                      >
                        {IconComponent && (
                          <IconComponent className="h-4 w-4 mr-2 flex-shrink-0" />
                        )}
                        <span className="truncate">{option?.label}</span>
                        <XCircle
                          className="ml-2 h-4 w-4 cursor-pointer flex-shrink-0"
                          onClick={(event) => {
                            event.stopPropagation();
                            if (!disabled) toggleOption(value);
                          }}
                        />
                      </Badge>
                    );
                  })}
                  {selectedValues.length > maxCount && (
                    <Badge
                      className={cn(
                        "bg-transparent text-foreground border-foreground/1 hover:bg-transparent",
                        isAnimating ? "animate-bounce" : "",
                        multiSelectVariants({ variant })
                      )}
                      style={{ animationDuration: `${animation}s` }}
                    >
                      {`+ ${selectedValues.length - maxCount} more`}
                      <XCircle
                        className="ml-2 h-4 w-4 cursor-pointer"
                        onClick={(event) => {
                          event.stopPropagation();
                          if (!disabled) clearExtraOptions();
                        }}
                      />
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
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={
                !lazyLoading ? "Search..." : "Type at least 3 characters..."
              }
              onKeyDown={handleInputKeyDown}
              disabled={disabled}
              onValueChange={handleSearchChange}
              value={searchValue}
              className="h-9"
            />
            <CommandList>
              <CommandEmpty className="p-2">
                {isLoading
                  ? "Loading..."
                  : filteredOptions.length === 0
                  ? "No matching options found."
                  : null}
              </CommandEmpty>
              <CommandGroup>
                {allowSelectAll && !isLoading && options.length > 0 && (
                  <CommandItem
                    key="all"
                    onSelect={toggleAll}
                    className="cursor-pointer"
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        selectedValues.length === options.length
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </div>
                    <span>(Select All)</span>
                  </CommandItem>
                )}
                {displayOptions.map((option) => {
                  const isSelected = selectedValues.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => !disabled && toggleOption(option.value)}
                      className={
                        disabled ? "cursor-not-allowed" : "cursor-pointer"
                      }
                      disabled={disabled}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary flex-shrink-0",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <CheckIcon className="h-4 w-4" />
                      </div>
                      {option.icon && (
                        <option.icon className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className="truncate flex-1">{option.label}</span>
                    </CommandItem>
                  );
                })}
                {totalFilteredCount > maxDisplayCount && (
                  <CommandItem className="opacity-50 cursor-default" disabled>
                    <span className="text-sm text-muted-foreground">
                      {`Showing ${maxDisplayCount} of ${totalFilteredCount} matching options. Refine your search to see more specific results.`}
                    </span>
                  </CommandItem>
                )}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <div className="flex items-center justify-between">
                  {selectedValues.length > 0 && (
                    <>
                      <CommandItem
                        onSelect={handleClear}
                        className="flex-1 justify-center cursor-pointer"
                        disabled={disabled}
                      >
                        Clear
                      </CommandItem>
                      <Separator
                        orientation="vertical"
                        className="flex min-h-6 h-full"
                      />
                    </>
                  )}
                </div>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
        {animation > 0 && selectedValues.length > 0 && (
          <WandSparkles
            className={cn(
              "cursor-pointer my-2 text-foreground bg-background w-3 h-3",
              isAnimating ? "" : "text-muted-foreground"
            )}
            onClick={() => !disabled && setIsAnimating(!isAnimating)}
          />
        )}
      </Popover>
    );
  }
);

MultiSelect.displayName = "MultiSelect";
