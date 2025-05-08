"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value: string | null
  onChange: (value: string | null) => void
  placeholder?: string
  emptyMessage?: string
  searchPlaceholder?: string
  className?: string
  popoverWidth?: string
  disabled?: boolean
  /**
   * Maximum number of options to display in the dropdown.
   * Optional, defaults to 50.
   */
  maxDisplayCount?: number
  /**
   * Whether the component is in a loading state.
   * Optional, defaults to false.
   */
  isLoading?: boolean
  /**
   * Callback function triggered when the search value changes.
   */
  onSearchChange?: (search: string) => void
  /**
   * If true, will only fetch options after the user has typed 3 characters.
   * Optional, defaults to false.
   */
  lazyLoading?: boolean
  /**
   * If true, will enable the search functionality.
   * Optional, defaults to true.
   */
  enableSearch?: boolean
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  emptyMessage = "No options found.",
  searchPlaceholder = "Search options...",
  className,
  popoverWidth = "w-full",
  disabled = false,
  maxDisplayCount = 50,
  isLoading = false,
  onSearchChange,
  lazyLoading = false,
  enableSearch = true,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  // Filter options based on search
  const filteredOptions = React.useMemo(() => {
    if (!searchValue.trim()) {
      return options;
    }
    
    const lowercasedSearch = searchValue.toLowerCase();
    return options.filter((option) =>
      option.label.toLowerCase().includes(lowercasedSearch)
    );
  }, [options, searchValue]);

  // Limit displayed options for performance
  const displayOptions = React.useMemo(() => {
    return filteredOptions.slice(0, maxDisplayCount);
  }, [filteredOptions, maxDisplayCount]);

  const totalFilteredCount = filteredOptions.length;

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    onSearchChange?.(value);
  };

  return (
    <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", 
            disabled && "opacity-50 cursor-not-allowed", 
            className
          )}
          disabled={disabled}
        >
          {value
            ? options.find((option) => option.value === value)?.label
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn(popoverWidth, "p-0")}>
        <Command shouldFilter={false}>
          {enableSearch && (
          <CommandInput 
            placeholder={!lazyLoading ? searchPlaceholder : "Type at least 3 characters..."}
            onValueChange={handleSearchChange}
            value={searchValue}
              className="h-9"
            />
          )}
          <CommandList>
            <CommandEmpty className="p-2">
              {isLoading 
                ? "Loading..." 
                : filteredOptions.length === 0 
                  ? emptyMessage 
                  : null}
            </CommandEmpty>
            <CommandGroup>
              {displayOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? null : currentValue)
                    setOpen(false)
                  }}
                  disabled={disabled}
                  className={disabled ? "cursor-not-allowed" : "cursor-pointer"}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
              {totalFilteredCount > maxDisplayCount && (
                <CommandItem className="opacity-50 cursor-default" disabled>
                  <span className="text-sm text-muted-foreground">
                    {`Showing ${maxDisplayCount} of ${totalFilteredCount} matching options. Refine your search to see more specific results.`}
                  </span>
                </CommandItem>
              )}
            </CommandGroup>
            {value && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      onChange(null)
                      setOpen(false)
                    }}
                    className="justify-center text-sm text-muted-foreground cursor-pointer"
                  >
                    Clear selection
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
