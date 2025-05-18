"use client";

import {
  ChangeEvent,
  FocusEvent,
  KeyboardEvent,
  useEffect,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TrendFrequency } from "@/types/entityTypes";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

const ITEMS_PER_PAGE = [5, 10, 25, 50, 100];

interface PaginationControlsProps {
  page: number;
  setPage: (page: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (n: number) => void;
  totalItems: number;
  visible: boolean;
  currentCount: number;
  trendFrequency?: TrendFrequency;
  showTrendFrequency?: boolean;
  setTrendFrequency?: (trendFrequency: TrendFrequency) => void;
}

export default function PaginationControls({
  page,
  setPage,
  itemsPerPage,
  setItemsPerPage,
  totalItems,
  visible,
  currentCount,
  showTrendFrequency = false,
  setTrendFrequency,
  trendFrequency,
}: PaginationControlsProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const [pageInput, setPageInput] = useState<string>(String(page));

  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    } else if (totalPages === 0 && newPage === 0) {
      setPage(0);
    } else {
      setPageInput(String(page));
    }
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
  };

  const handlePageInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const validateAndSetPage = (inputVal: string) => {
    const potentialPage = parseInt(inputVal, 10);
    if (!isNaN(potentialPage)) {
      const validPage = Math.max(
        totalPages === 0 ? 0 : 1,
        Math.min(potentialPage, totalPages)
      );
      handlePageChange(validPage);
    } else {
      setPageInput(String(page));
    }
  };

  const handlePageInputBlur = (e: FocusEvent<HTMLInputElement>) => {
    validateAndSetPage(e.target.value);
  };

  const handlePageInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      validateAndSetPage((e.target as HTMLInputElement).value);
      (e.target as HTMLInputElement).blur();
    } else if (e.key === "Escape") {
      setPageInput(String(page));
      (e.target as HTMLInputElement).blur();
    }
  };

  const PaginationDisplay = ({
    page,
    itemsPerPage,
    totalItems,
    currentCount,
  }: {
    page: number;
    itemsPerPage: number;
    totalItems: number;
    currentCount: number;
  }) => {
    if (currentCount === 0) return "No alumni found";

    const start = (page - 1) * itemsPerPage + 1;
    const end = Math.min((page - 1) * itemsPerPage + currentCount, totalItems);

    return (
      <div className="text-gray-500">
        <span className="font-bold">{start}-{end}</span>
        <span className="mx-1">out of</span>
        <span className="font-bold">{totalItems}</span>
        <span className="ml-1">shown</span>
      </div>
    );
  };


return visible ? (
  <div className="flex items-center justify-between flex-shrink-0 pt-2">
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="min-w-[90px] justify-start text-left font-medium text-[#000000] border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
          >
            {itemsPerPage} / page
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="shadow-md rounded-lg border-gray-200">
          {ITEMS_PER_PAGE.map((item) => (
            <DropdownMenuItem
              key={item}
              onClick={() => handleItemsPerPageChange(item)}
              className="hover:bg-gray-100 transition-colors"
            >
              {item}
              {item === itemsPerPage && (
                <CheckIcon className="h-4 w-4 text-[#8C2D19]" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-1 text-[12.5px] text-[#000000]">
        <PaginationDisplay
          page={page}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          currentCount={currentCount}
        />
      </div>
    </div>

    <div className="flex items-center space-x-4">
      {showTrendFrequency && (
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="min-w-[90px] justify-start text-left font-medium text-[#000000] border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
              >
                {trendFrequency}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="shadow-md rounded-lg border-gray-200">
              {Object.values(TrendFrequency).map((item) => (
                <DropdownMenuItem
                  key={item}
                  onClick={() => setTrendFrequency?.(item)}
                  className="hover:bg-gray-100 transition-colors"
                >
                  {item}
                  {item === trendFrequency && (
                    <CheckIcon className="h-4 w-4 text-[#8C2D19]" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={page === 1 || totalPages === 0}
          onClick={() => handlePageChange(page - 1)}
          className="rounded-full p-1 border-gray-200 hover:bg-[#A13A23] hover:bg-opacity-10 hover:scale-110 transition-transform disabled:opacity-40"
        >
          <ArrowLeftIcon className="h-4 w-4 text-[#8C2D19]" />
        </Button>

        <div className="flex items-center text-xs text-[#000000] space-x-0.5">
          <Input
            type="number"
            value={pageInput}
            onChange={handlePageInputChange}
            onKeyDown={handlePageInputKeyDown}
            onBlur={handlePageInputBlur}
            min={totalPages > 0 ? 1 : 0}
            max={totalPages}
            className={`h-8 p-1 text-center border border-gray-200 rounded-lg focus:border-[#8C2D19] focus:ring-[#8C2D19] hover:bg-gray-100 shadow-sm transition-colors ${
              pageInput.length === 1
                ? "w-9"
                : pageInput.length === 2
                ? "w-12"
                : "w-16"
            }`}
            disabled={totalPages === 0}
          />
          <span>of {totalPages}</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          disabled={page === totalPages || totalPages === 0}
          onClick={() => handlePageChange(page + 1)}
          className="rounded-full p-1 border-gray-200 hover:bg-[#A13A23] hover:bg-opacity-10 hover:scale-110 transition-transform disabled:opacity-40"
          aria-label="Go to next page"
        >
          <ArrowRightIcon className="h-4 w-4 text-[#8C2D19]" />
        </Button>
      </div>
    </div>
  </div>
) : (
      <div className="flex min-h-[40px] items-center justify-between flex-shrink-0 pt-2" />
    );
}
