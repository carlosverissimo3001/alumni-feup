"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  FilterState,
  PaginationControls,
  CustomTableHeader,
  CustomTableRow,
  TableNumberCell,
} from "../common/";
import ImageWithFallback from "../../ui/image-with-fallback";
import { SortBy, SortOrder, ITEMS_PER_PAGE } from "@/consts";
import { ExternalLink, Filter, Users, Search, X, Earth } from "lucide-react";
import TableTitle from "../common/TableTitle";
import Image from "next/image";
import { AlumniListItemDto, AlumniListResponseDto, AnalyticsControllerGetAnalyticsSelectorTypeEnum as SelectorType } from "@/sdk";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AlumniTableSkeleton from "../skeletons/AlumniTableSkeleton";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { useFetchAnalytics } from "@/hooks/analytics/useFetchAnalytics";

type AlumniTableProps = {
  globalData?: AlumniListResponseDto;
  isGlobalDataLoading?: boolean;
  filters: FilterState;
  onAddToFilters?: (alumniId: string) => void;
};

const PaginationDisplay = ({
  page,
  itemsPerPage,
  totalItems,
  currentCount,
  isLoading,
}: {
  page: number;
  itemsPerPage: number;
  totalItems: number;
  currentCount: number;
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <div className="text-gray-500 animate-pulse">
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (currentCount === 0) return "No alumni found";

  const start = (page - 1) * itemsPerPage + 1;
  const end = Math.min((page - 1) * itemsPerPage + currentCount, totalItems);

  return (
    <div className="text-gray-700 bg-gray-100 px-3 py-1 rounded-full shadow-sm">
      <span className="font-semibold">
        {start}-{end}
      </span>
      <span className="mx-1 italic">out of</span>
      <span className="font-semibold">{totalItems}</span>
      <span className="ml-1 italic">shown</span>
    </div>
  );
};

export const AlumniTable = ({ globalData, isGlobalDataLoading, filters, onAddToFilters }: AlumniTableProps) => {
  const { user } = useAuth();
  const userId = user?.id;

  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE[2]);
  const [sortField, setSortField] = useState<SortBy>(SortBy.NAME);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.ASC);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pageInput, setPageInput] = useState<string>(String(page));

  const calculateTableHeight = (itemCount: number) => {
    const rowHeight = 56;
    const headerHeight = 100;
    const paginationHeight = 60;
    const minVisibleRows = 5;

    const calculatedHeight =
      headerHeight +
      Math.max(itemCount, minVisibleRows) * rowHeight +
      paginationHeight;

    const minHeight = 440;
    const maxHeight = 800;

    return Math.max(minHeight, Math.min(calculatedHeight, maxHeight));
  };

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const shouldUseGlobalData = useMemo(() => {
    return (
      page === 1 &&
      itemsPerPage === ITEMS_PER_PAGE[1] &&
      sortField === SortBy.NAME &&
      sortOrder === SortOrder.ASC &&
      searchQuery === ""
    );
  }, [page, itemsPerPage, sortField, sortOrder, searchQuery]);

  const { data, isLoading, isFetching } = useFetchAnalytics({
    params: {
      ...filters,
      limit: itemsPerPage,
      sortBy: sortField,
      sortOrder: sortOrder,
      offset: (page - 1) * itemsPerPage,
      alumniSearch: searchQuery || undefined,
      selectorType: SelectorType.Alumni,
    },
  });

  const currentData = shouldUseGlobalData ? globalData : data?.alumniData;

  const isWaitingForData =
  (shouldUseGlobalData && isGlobalDataLoading) ||
  (!shouldUseGlobalData && (isLoading || isFetching));


  const buildMapUrl = (
    latitude?: number,
    longitude?: number
  ): string | undefined => {
    if (latitude == null || longitude == null) {
      return undefined;
    }
    return `/?lat=${latitude}&lng=${longitude}&group_by=cities`;
  };

  const alumnus = currentData?.alumni || [];
  const totalItems = currentData?.count || 0;

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const isRowInFilters = (alumni: AlumniListItemDto) => {
    return filters.alumniIds?.includes(alumni.id) ?? false;
  };

  const getInitials = (name: string) => {
    const words = name.split(" ");
    const firstInitial = words[0][0];
    const lastInitial = words[words.length - 1][0];
    return (firstInitial + lastInitial).toUpperCase();
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
                customAlumniHeader="LinkedIn"
              />

              {isWaitingForData ? (
                <AlumniTableSkeleton className="animate-pulse bg-gradient-to-r from-gray-200 to-gray-100" />
              ) : (
                <TableBody className="bg-white divide-y divide-gray-200">
                  {alumnus.map((alumni: AlumniListItemDto, index: number) => {
                    const rowNumber = (page - 1) * itemsPerPage + index + 1;
                    const isLoggedUser = alumni.id === user?.id;
                    return (
                      <CustomTableRow
                        key={alumni.id}
                        index={index}
                        isLoggedUser={isLoggedUser}
                        className={`transition-all duration-200 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 ${
                          index % 2 === 0 ? "bg-gray-50" : "bg-white"
                        }`}
                      >
                        <TableNumberCell rowNumber={rowNumber} />
                        <TableCell
                          className={`w-[74%] py-2.5 pl-4 text-sm font-medium text-gray-800 flex items-center gap-2 align-middle ${
                            isRowInFilters(alumni)
                              ? "font-bold text-[#8C2D19]"
                              : ""
                          }`}
                        >
                          <div className="min-w-[32px] w-8 h-8 mr-2 rounded-full overflow-hidden flex items-center justify-center bg-gray-50 ring-2 ring-gray-100 hover:ring-4 hover:ring-gradient-to-r hover:from-[#8C2D19] hover:to-[#A13A23] transition-all duration-300">
                            {alumni.profilePictureUrl ? (
                              <ImageWithFallback
                                src={alumni.profilePictureUrl}
                                alt={alumni.fullName}
                                width={32}
                                height={32}
                                className="rounded-full object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 text-sm font-semibold">
                                {getInitials(alumni.fullName)}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-1">
                            <Button
                              variant="link"
                              className="text-sm font-medium text-gray-800 text-left h-auto p-1 hover:text-[#8C2D19] transition-colors flex items-center group-hover:text-[#8C2D19]"
                              onClick={() => {
                                window.open(`/profile/${alumni.id}`, "_blank");
                              }}
                            >
                              <div className="text-ellipsis overflow-hidden text-left">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span>{alumni.fullName}</span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {isLoggedUser ? (
                                        <p>Go to your profile</p>
                                      ) : (
                                        <p>{alumni.fullName}</p>
                                      )}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </Button>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <ExternalLink
                                    className="h-4 w-4 text-gray-400 transition-opacity cursor-pointer hover:text-[#8C2D19]"
                                    onClick={() => {
                                      window.open(
                                        `/profile/${alumni.id}`,
                                        "_blank"
                                      );
                                    }}
                                  />
                                </TooltipTrigger>
                                <TooltipContent>
                                  {isLoggedUser ? (
                                    <p>Go to your profile</p>
                                  ) : (
                                    <p>
                                      Go to {alumni.fullName.split(" ")[0]}
                                      &apos;s profile
                                    </p>
                                  )}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            {alumni.currentRoleLocation &&
                              alumni.currentRoleLocation.latitude &&
                              alumni.currentRoleLocation.longitude && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Earth
                                        className="h-4 w-4 text-gray-400 transition-opacity cursor-pointer hover:text-[#8C2D19]"
                                        onClick={() => {
                                          if (
                                            alumni.currentRoleLocation
                                              ?.latitude &&
                                            alumni.currentRoleLocation
                                              ?.longitude
                                          ) {
                                            window.open(
                                              buildMapUrl(
                                                alumni.currentRoleLocation
                                                  .latitude,
                                                alumni.currentRoleLocation
                                                  .longitude
                                              ),
                                              "_blank"
                                            );
                                          }
                                        }}
                                      />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {isLoggedUser ? (
                                        <p>View your location on map</p>
                                      ) : (
                                        <p>
                                          View {alumni.fullName.split(" ")[0]}{" "}
                                          on map
                                        </p>
                                      )}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            {alumni.id === userId && (
                              <div className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-[#8C2D19]/10 to-[#A13A23]/10 text-[#8C2D19] rounded-full">
                                You
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell
                          className={`w-[12%] py-2.5 text-sm text-[#000000] ${
                            isRowInFilters(alumni)
                              ? "font-bold text-[#8C2D19]"
                              : "text-[#000000]"
                          }`}
                        >
                          <div className="flex items-center gap-0 justify-center">
                            {alumni.linkedinUrl && (
                              <Button
                                variant="ghost"
                                title="Go to LinkedIn Profile"
                                size="sm"
                                className="p-1.5 h-8 w-8 rounded-full hover:bg-gradient-to-r hover:from-[#8C2D19]/10 hover:to-[#A13A23]/10 group/linkedin transition-all duration-200"
                                onClick={() =>
                                  window.open(alumni.linkedinUrl!, "_blank")
                                }
                              >
                                <Image
                                  src="/logos/linkedin-icon.svg"
                                  alt="LinkedIn"
                                  width={20}
                                  height={20}
                                  className="group-hover/linkedin:scale-110 group-hover/linkedin:brightness-110 transition-transform duration-200"
                                />
                              </Button>
                            )}
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
          currentCount={alumnus?.length}
        />
      </>
    );
  };

  return (
    <div
      className="w-full flex flex-col border rounded-xl shadow-xl p-3 box-border bg-gradient-to-br from-white via-gray-50 to-[#8C2D19]/5"
      style={{ height: `${calculateTableHeight(alumnus?.length || 0)}px` }}
    >
      <div className="flex items-center justify-between mb-4 mt-2 px-2">
        <TableTitle
          title="Alumni"
          icon={<Users className="h-5 w-5 text-[#8C2D19]" />}
          tooltipMessage="Alumni from our programs"
          className="pl-1 relative group font-bold text-gray-800 text-lg"
        >
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#8C2D19] to-[#A13A23] transition-all duration-300 group-hover:w-full" />
        </TableTitle>
        <div className="relative flex-1 mx-8 max-w-md">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-all duration-200 group-hover:text-[#8C2D19] group-hover:scale-110 group-focus-within:text-[#8C2D19] group-focus-within:scale-110" />
            <Input
              type="text"
              placeholder="Search alumni..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 pr-12 py-2 w-full bg-gradient-to-r from-gray-50 to-white border-gray-200 shadow-sm transition-all duration-200
                       hover:border-[#8C2D19]/50 hover:shadow-md focus-visible:border-[#8C2D19]/70 focus-visible:ring-2 focus-visible:ring-[#8C2D19]/30
                       placeholder:text-gray-400 placeholder:text-sm placeholder:italic rounded-lg"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 hover:text-[#8C2D19] transition-colors"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {isLoading && searchQuery && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gradient-to-r from-[#8C2D19]/20 to-[#A13A23]/20 border-t-[#8C2D19]"></div>
              </div>
            )}
          </div>
        </div>
        <div className="text-sm text-gray-500 font-medium min-w-[150px] text-right">
          <PaginationDisplay
            page={page}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            currentCount={alumnus.length}
            isLoading={isLoading || isFetching}
          />
        </div>
      </div>
      {renderTable()}
    </div>
  );
};
