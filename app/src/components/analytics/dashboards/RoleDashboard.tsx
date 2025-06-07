"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RoleListItemDto, RoleListResponseDto } from "@/sdk";
import { Briefcase, Filter, Info, CheckIcon, ChevronDown } from "lucide-react";

import { DashboardSkeleton } from "../skeletons/DashboardSkeleton";
import TableTitle from "../common/TableTitle";
import { SortBy, SortOrder, ITEMS_PER_PAGE, DASHBOARD_HEIGHT } from "@/consts";
import {
  NotFoundComponent,
  TableNameCell,
  TableNumberCell,
  ViewToggle,
  CountComponent,
  LoadingChart,
  CustomTableRow,
  ChartView,
  FilterState,
  TrendLineComponent,
  CustomTableHeader,
  PaginationControls,
} from "../common/";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ViewType } from "@/types/view";
import { EntityType, TrendFrequency } from "@/types/entityTypes";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { ESCO_INFO, ISCO_INFO } from "@/consts";
import { ESCO_CLASSIFICATION_LEVEL } from "@/types/drillType";
import { RoleHierarchyInfo } from "../misc/RoleHierarchyInfo";
import { useFetchAnalytics } from "@/hooks/analytics/useFetchAnalytics";
import { AnalyticsControllerGetAnalyticsSelectorTypeEnum as SelectorType } from "@/sdk";

type RoleDashboardProps = {
  globalData?: RoleListResponseDto;
  isGlobalDataLoading?: boolean;
  onDataUpdate: (roleCount: number) => void;
  filters: FilterState;
  onAddToFilters?: (roleId: string) => void;
  classificationLevel: ESCO_CLASSIFICATION_LEVEL;
  setClassificationLevel: (classificationLevel: ESCO_CLASSIFICATION_LEVEL) => void;
};

export const RoleDashboard = ({
  globalData,
  isGlobalDataLoading,
  filters,
  onAddToFilters,
  onDataUpdate,
  classificationLevel,
  setClassificationLevel,
}: RoleDashboardProps) => {
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE[1]);
  const [sortField, setSortField] = useState<SortBy>(SortBy.COUNT);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.DESC);
  const [view, setView] = useState<ViewType>(ViewType.TABLE);
  const [trendFrequency, setTrendFrequency] = useState<TrendFrequency>(
    TrendFrequency.Y5
  );

  const filtersRef = useRef<FilterState>(filters);

  useEffect(() => {
    const changed =
      JSON.stringify(filtersRef.current) !== JSON.stringify(filters);
    if (changed) {
      filtersRef.current = filters;
      setPage(1);
      setItemsPerPage(ITEMS_PER_PAGE[1]);
      setSortField(SortBy.COUNT);
      setSortOrder(SortOrder.DESC);
      setView(ViewType.TABLE);
      setTrendFrequency(TrendFrequency.Y5);
    }
  }, [filters]);

  // Determine if globalData is valid to use
  const shouldUseGlobalData = useMemo(() => {
    return (
      page === 1 &&
      itemsPerPage === ITEMS_PER_PAGE[1] &&
      sortField === SortBy.COUNT &&
      sortOrder === SortOrder.DESC &&
      view === ViewType.TABLE &&
      trendFrequency === TrendFrequency.Y5 &&
      classificationLevel === ESCO_CLASSIFICATION_LEVEL.LEVEL_5
    );
  }, [page, itemsPerPage, sortField, sortOrder, view, trendFrequency, classificationLevel]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pageInput, setPageInput] = useState<string>(String(page));

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  const { data, isLoading, isFetching } = useFetchAnalytics({
    params: {
      ...filters,
      limit: itemsPerPage,
      sortBy: sortField,
      sortOrder,
      offset: (page - 1) * itemsPerPage,
      includeRoleTrend: view === ViewType.TREND,
      selectorType: SelectorType.Role,
      escoClassificationLevel: Number(classificationLevel.split(" ")[1]),
    },
    options: {
      enabled: !shouldUseGlobalData,
      isInitialLoad: shouldUseGlobalData,
    },
  });

  const currentData = shouldUseGlobalData ? globalData : data?.roleData;
  const roles = currentData?.roles || [];
  const totalItems = currentData?.distinctCount || 0;

  const isWaitingForData =
  (shouldUseGlobalData && isGlobalDataLoading) ||
  (!shouldUseGlobalData && (isLoading || isFetching));

  useEffect(() => {
    if(currentData) {
     onDataUpdate(currentData.count);
    }
  }, [currentData, onDataUpdate]);

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

  const isRowInFilters = (row: RoleListItemDto): boolean => {
    return filters.escoCodes?.includes(row.code) ?? false;
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
                showTrend={view === ViewType.TREND}
                trendFrequency={trendFrequency}
                customAlumniHeader="Roles"
                hoverMessage="The total of alumni roles classified with this title"
              />

              {isWaitingForData ? (
                <DashboardSkeleton />
              ) : (
                <TableBody className="bg-white divide-y divide-gray-200">
                  {roles.length > 0 ? (
                    roles.map((role: RoleListItemDto, index: number) => {
                      const rowNumber = (page - 1) * itemsPerPage + index + 1;

                      return (
                        <CustomTableRow
                          key={role.code}
                          index={index}
                          className="group"
                        >
                          <TableNumberCell rowNumber={rowNumber} />
                          <TableNameCell
                            name={role.name}
                            isRowInFilters={!!isRowInFilters(role)}
                            pageUrl={role.escoUrl}
                          />
                          <TableCell
                            className={`w-[12%] px-4 ${
                              view === ViewType.TABLE ? "py-1" : ""
                            } text-sm ${
                              isRowInFilters(role)
                                ? "font-bold text-[#8C2D19]"
                                : "text-[#000000]"
                            } align-middle hover:text-[#8C2D19] transition-colors relative`}
                          >
                            <div className="flex items-center gap-0 justify-center">
                              {view === ViewType.TABLE ? (
                                <>
                                  {classificationLevel !==
                                    ESCO_CLASSIFICATION_LEVEL.LEVEL_1 && (
                                    <div
                                      className={`${
                                        isRowInFilters(role)
                                          ? "opacity-100"
                                          : "opacity-0 group-hover:opacity-100"
                                      } transition-opacity mr-2`}
                                    >
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="p-0 h-6 w-6 rounded-full bg-gray-100 hover:bg-gray-200 group-hover:opacity-100 opacity-0 transition-opacity"
                                              aria-label="Show hierarchy"
                                            >
                                              <Info className="h-4 w-4 text-[#8C2D19]" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent
                                            align="end"
                                            className="max-w-md p-2 text-sm text-gray-800 bg-white border shadow-md rounded-md"
                                          >
                                            <RoleHierarchyInfo
                                              code={role.code}
                                            />
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                  )}
                                  <CountComponent count={role.count} />
                                  <div
                                    className={`${
                                      isRowInFilters(role)
                                        ? "opacity-100"
                                        : "opacity-0 group-hover:opacity-100"
                                    } transition-opacity ml-2`}
                                  >
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            aria-label="Add to filters"
                                            variant="ghost"
                                            size="sm"
                                            className="p-1 h-6 w-6 rounded-full bg-gray-100 hover:bg-gray-200"
                                            onClick={() =>
                                              onAddToFilters?.(role.code)
                                            }
                                          >
                                            <Filter className="h-4 w-4 text-[#8C2D19]" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Filter on {role.name}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                </>
                              ) : (
                                <TrendLineComponent
                                  dataPoints={role.trend}
                                  trendFrequency={trendFrequency}
                                />
                              )}
                            </div>
                          </TableCell>
                        </CustomTableRow>
                      );
                    })
                  ) : (
                    <NotFoundComponent
                      message="No role data available"
                      description="Try adjusting your filters to find roles that match your criteria."
                      colSpan={4}
                    />
                  )}
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
          visible={roles.length > 0}
          currentCount={roles.length}
          showTrendFrequency={view === ViewType.TREND}
          trendFrequency={trendFrequency}
          setTrendFrequency={setTrendFrequency}
        />
      </>
    );
  };

  const renderChartView = () => (
    <div className="flex-1 flex flex-col border-t border-b border-gray-200 overflow-hidden">
      <div className="flex-1 flex items-center justify-center">
        {isWaitingForData ? (
          <LoadingChart message="Loading chart data..." />
        ) : roles.length === 0 ? (
          <NotFoundComponent
            message="No role data available"
            description="Try adjusting your filters to find roles that match your criteria."
            colSpan={4}
          />
        ) : (
          <ChartView
            data={roles.map((role) => ({
              name: role.name,
              id: role.code,
              count: role.count,
            }))}
            isLoading={isWaitingForData}
            entityType={EntityType.ROLE}
          />
        )}
      </div>
    </div>
  );

  return (
    <div
      className={`w-full ${DASHBOARD_HEIGHT} flex flex-col border rounded-xl shadow-lg p-3 box-border bg-white`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <TableTitle
            title="Positions"
            icon={<Briefcase className="h-5 w-5 text-[#8C2D19]" />}
            tooltipMessage="Distribution of alumni by the classification of their role."
          />
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2px-2 py-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="min-w-[90px] justify-start text-left font-medium text-[#000000] border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 transition-colors flex items-center gap-1"
                >
                  {classificationLevel}
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="shadow-md rounded-lg border-gray-200">
                {Object.values(ESCO_CLASSIFICATION_LEVEL).map(
                  (item: ESCO_CLASSIFICATION_LEVEL) => (
                    <DropdownMenuItem
                      key={item}
                      onClick={() => {
                        // Reset page to 1 when changing classification level
                        setClassificationLevel(item);
                      }}
                      className="hover:bg-gray-100 transition-colors"
                    >
                      {item}
                      {item === classificationLevel && (
                        <CheckIcon className="h-4 w-4 text-[#8C2D19]" />
                      )}
                    </DropdownMenuItem>
                  )
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-5 w-5 text-[#8C2D19]" />
              </TooltipTrigger>
              <TooltipContent className="max-w-md" align="end">
                <div className="space-y-2">
                  <p>
                    <strong>Levels 1-4:</strong>{" "}
                    <a
                      href={ISCO_INFO}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      ISCO-08
                    </a>{" "}
                    (broad international classification)
                  </p>
                  <p>
                    <strong>Levels 5+:</strong>{" "}
                    <a
                      href={ESCO_INFO}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      ESCO
                    </a>{" "}
                    (detailed occupations, extends ISCO-08)
                  </p>
                  <p className="font-bold text-[13px]">
                    Roles here are classified at ESCO level 5+
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="border rounded-md overflow-hidden">
          <div className="border rounded-md overflow-hidden">
            <ViewToggle view={view} setView={setView} />
          </div>
        </div>
      </div>

      {view === ViewType.TABLE && renderTable()}
      {view === ViewType.TREND && renderTable()}
      {view === ViewType.CHART && renderChartView()}
    </div>
  );
};
