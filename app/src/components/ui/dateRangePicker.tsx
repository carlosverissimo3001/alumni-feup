"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type DatePickerWithRangeProps = {
  className?: string;
  value?: DateRange;
  onChange?: (date: DateRange | undefined) => void;
}

export function DatePickerWithRange({
  className,
  value,
  onChange,
}: DatePickerWithRangeProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(value);
  const [month, setMonth] = React.useState<Date>(value?.from || new Date());

  const years = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - 2000 + 1 }, (_, i) => 2000 + i);
  }, []);

  const months = React.useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      return { value: i, label: format(new Date(2000, i, 1), "MMMM") };
    });
  }, []);

  React.useEffect(() => {
    setDate(value);
  }, [value]);

  const handleMonthChange = (monthValue: string) => {
    const newMonth = new Date(month.getFullYear(), parseInt(monthValue));
    setMonth(newMonth);
  };

  const handleYearChange = (yearValue: string) => {
    const newMonth = new Date(parseInt(yearValue), month.getMonth());
    setMonth(newMonth);
  };

  const handleSetToPresent = () => {
    if (date?.from) {
      const newDate = { from: date.from, to: new Date() };
      setDate(newDate);
      if (onChange) {
        onChange(newDate);
      }
    }
  };

  const today = React.useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full min-h-10 h-auto justify-start text-left font-normal px-3 py-1",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              <>
                {format(date.from, "LLL dd, y")}
                {date.to ? (
                  <> - {format(date.to, "LLL dd, y")}</>
                ) : (
                  <> ---</>
                )}
              </>
            ) : (
              <span>Pick a date range for the role</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex gap-2 p-3 bg-muted/50">
            <Select
              value={month.getMonth().toString()}
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={month.getFullYear().toString()}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="w-[95px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {date?.from && !date?.to && (
              <Button
                variant="outline"
                className="ml-auto text-[#8C2D19] border-[#8C2D19] hover:bg-[#8C2D19] hover:text-white"
                onClick={handleSetToPresent}
              >
                Set to Present
              </Button>
            )}
            {date?.from && date?.to && (
              <Button
                variant="outline"
                className="ml-auto text-[#8C2D19] border-[#8C2D19] hover:bg-[#8C2D19] hover:text-white"
                onClick={() => onChange?.({ from: date.from, to: undefined })}
              >
                Clear End Date
              </Button>
            )}
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            month={month}
            onMonthChange={setMonth}
            selected={date}
            onSelect={(newDate) => {
              setDate(newDate);
              if (onChange) {
                onChange(newDate);
              }
            }}
            numberOfMonths={2}
            disabled={{ after: today }}
            fromDate={new Date(2000, 0, 1)}
            toDate={today}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
