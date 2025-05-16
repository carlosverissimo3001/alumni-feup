"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FilterState } from "../common/GlobalFilters";
import ImageWithFallback from "../../ui/image-with-fallback";
import PaginationControls from "../common/PaginationControls";
import CustomTableHeader from "../common/CustomTableHeader";
import { SortBy, SortOrder, ITEMS_PER_PAGE } from "@/consts";
import { ExternalLink, Filter, Users } from "lucide-react";
import TableTitle from "../common/TableTitle";
import Image from "next/image";
import { useAlumniList } from "@/hooks/analytics/useAlumniList";
import { AlumniListItemDto } from "@/sdk";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CustomTableRow from "../common/CustomTableRow";
import AlumniTableSkeleton from "../skeletons/AlumniTableSkeleton";


type AlumniTableProps = {
  filters: FilterState;
  onAddToFilters?: (alumniId: string) => void;
};

const PaginationDisplay = ({ 
  page, 
  itemsPerPage, 
  totalItems, 
  currentCount 
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
    <>
      <span className="font-bold">{start}</span>
      {" - "}
      <span className="font-bold">{end}</span>
      <span className="mx-1">out of</span>
      <span className="font-bold">{totalItems}</span>
      <span className="ml-1">shown</span>
    </>
  );
};

export default function AlumniTable({
  filters,
  onAddToFilters,
}: AlumniTableProps) {
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE[2]);
  const [sortField, setSortField] = useState<SortBy>(SortBy.NAME);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.ASC);

  // Calculate dynamic height
  const calculateTableHeight = (itemCount: number) => {
    const rowHeight = 56;
    const headerHeight = 100;
    const paginationHeight = 60;
    const calculatedHeight =
      headerHeight + itemCount * rowHeight + paginationHeight;

    const minHeight = 200;
    const maxHeight = 800;

    return Math.max(minHeight, Math.min(calculatedHeight, maxHeight));
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pageInput, setPageInput] = useState<string>(String(page));

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const { data, isLoading, isFetching } = useAlumniList({
    ...filters,
    limit: itemsPerPage,
    sortBy: sortField,
    sortOrder: sortOrder,
    offset: (page - 1) * itemsPerPage,
    includeTrend: false,
  });

  const alumnus = data?.alumni || [];
  const totalItems = data?.filteredCount || 0;

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  // Update page input when page changes
  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  const handleSort = (field: SortBy) => {
    if (sortField === field) {
      setSortOrder(
        sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC
      );
    } else {
      setSortField(field);
      setSortOrder(SortOrder.DESC);
    }
  };

  const renderTable = () => {
    return (
      <>
        <div className="flex-1 relative border-t border-b border-gray-200 flex flex-col overflow-hidden">
          <TableContainer className="flex-1 overflow-auto custom-scrollbar">
            <Table className="min-w-full bg-white table-fixed [&>div]:overflow-visible">
              <CustomTableHeader
                sortField={sortField}
                sortOrder={sortOrder}
                onSort={handleSort}
                showTrend={false}
                allowCountSort={false}
                customSecondHeader="LinkedIn"
              />

              {isLoading || isFetching ? (
                <AlumniTableSkeleton className="animate-pulse bg-gradient-to-r from-gray-200 to-gray-100" />
              ) : (
                <TableBody className="bg-white divide-y divide-gray-200">
                  {alumnus.map((alumni: AlumniListItemDto, index: number) => {
                    const rowNumber = (page - 1) * itemsPerPage + index + 1;
                    return (
                      <CustomTableRow key={alumni.id} index={index}>
                        <TableCell className="w-[6%] py-2.5 pl-4 text-sm text-gray-500 font-medium align-middle">
                          <div className="flex items-center gap-2">
                            <span>{rowNumber}</span>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      aria-label="Add to filters"
                                      variant="ghost"
                                      size="sm"
                                      className="p-1 h-6 w-6 rounded-full bg-gray-100 hover:bg-gray-200"
                                      onClick={() =>
                                        onAddToFilters?.(alumni.id)
                                      }
                                    >
                                      <Filter className="h-4 w-4 text-[#8C2D19]" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent align="start">
                                    <p>Filter on {alumni.fullName}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="w-[82%] py-2.5 pl-4 text-sm font-medium text-[#000000] flex items-center gap-2 align-middle">
                          <div className="min-w-[32px] w-8 h-8 mr-2 rounded-full overflow-hidden flex items-center justify-center bg-gray-50 ring-2 ring-gray-100 hover:ring-[#A13A23] hover:ring-4 transition-all duration-300">
                            <ImageWithFallback
                              src={alumni.profilePictureUrl || ""}
                              alt={alumni.fullName}
                              width={32}
                              height={32}
                              className="rounded-full object-cover w-full h-full"
                            />
                          </div>
                          <div
                            className="flex items-center gap-2 flex-1"
                            title="Go to Alumni Profile"
                          >
                            <Button
                              variant="link"
                              className="text-sm font-medium text-[#000000] text-left h-auto p-1 hover:text-[#8C2D19] transition-colors flex items-center group-hover:text-[#8C2D19]"
                              onClick={() => {
                                window.open(`/profile/${alumni.id}`, "_blank");
                              }}
                            >
                              <div
                                title={alumni.fullName}
                                className="text-ellipsis overflow-hidden text-left"
                              >
                                {alumni.fullName}
                              </div>
                            </Button>
                            <ExternalLink
                              className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-[#8C2D19]"
                              onClick={() => {
                                window.open(`/profile/${alumni.id}`, "_blank");
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="w-[12%] py-2.5 text-sm text-[#000000]">
                          {alumni.linkedinUrl && (
                            <Button
                              variant="ghost"
                              title="Go to LinkedIn Profile"
                              size="sm"
                              className="p-1.5 h-8 w-8 rounded-full hover:bg-[#A13A23]/10 group/linkedin transition-all duration-200 flex items-center justify-center"
                              onClick={() =>
                                window.open(alumni.linkedinUrl!, "_blank")
                              }
                            >
                              <Image
                                src="/logos/linkedin-icon.svg"
                                alt="LinkedIn"
                                width={20}
                                height={20}
                                className="group-hover/linkedin:scale-110 transition-transform duration-200"
                              />
                            </Button>
                          )}
                        </TableCell>
                      </CustomTableRow>
                    );
                  })}
                </TableBody>
              )}
            </Table>
          </TableContainer>
        </div>

        <PaginationControls
          page={page}
          setPage={setPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          totalItems={totalItems}
          visible={alumnus?.length > 0}
        />
      </>
    );
  };

  return (
    <div
      className={`w-full flex flex-col border rounded-xl shadow-lg p-3 box-border bg-white`}
      style={{ height: `${calculateTableHeight(alumnus?.length || 0)}px` }}
    >
      <div className="flex items-center justify-between mb-4 px-2">
        <TableTitle
          title="Alumni"
          icon={<Users className="h-5 w-5 text-[#8C2D19]" />}
          tooltipMessage="Alumni from our programs"
          className="pl-1"
        />
        {!isLoading && !isFetching && (
          <div className="text-sm text-gray-500 font-medium">
            <PaginationDisplay
              page={page}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              currentCount={alumnus.length}
            />
          </div>
        )}
      </div>
      {renderTable()}
    </div>
  );
}
