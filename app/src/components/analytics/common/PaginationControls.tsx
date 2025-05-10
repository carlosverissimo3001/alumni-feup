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
import { Input } from "@/components/ui/input";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

const ITEMS_PER_PAGE = [5, 10, 25, 50, 100];

interface PaginationControlsProps {
  page: number;
  setPage: (page: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (n: number) => void;
  totalItems: number;
}

export default function PaginationControls({
  page,
  setPage,
  itemsPerPage,
  setItemsPerPage,
  totalItems,
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

  return (
    <div className="flex items-center justify-between flex-shrink-0 pt-2">
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="min-w-[90px] justify-start text-left font-medium text-[#000000] border-gray-200 rounded-lg"
            >
              {itemsPerPage} / page
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {ITEMS_PER_PAGE.map((items) => (
              <DropdownMenuItem
                key={items}
                onClick={() => handleItemsPerPageChange(items)}
              >
                {items}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            disabled={page === 1 || totalPages === 0}
            onClick={() => handlePageChange(page - 1)}
            className="rounded-full p-1 border-gray-200 hover:bg-[#A13A23] hover:bg-opacity-10"
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
              className={`h-8 p-1 text-center border border-gray-200 rounded-lg focus:border-[#8C2D19] focus:ring-[#8C2D19] hover:bg-gray-50 ${
                pageInput.length === 1 ? "w-9" : pageInput.length === 2 ? "w-12" : "w-16"
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
            className="rounded-full p-2 border-gray-200 hover:bg-[#A13A23] hover:bg-opacity-10"
            aria-label="Go to next page"
          >
            <ArrowRightIcon className="h-4 w-4 text-[#8C2D19]" />
          </Button>
        </div>
      </div>
    </div>
  );
}
