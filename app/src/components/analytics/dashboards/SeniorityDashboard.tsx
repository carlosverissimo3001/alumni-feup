"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Filter, Trophy } from "lucide-react";

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
import { SeniorityListItemDto, SeniorityListResponseDto } from "@/sdk";
import { SENIORITY_LEVEL, SENIORITY_LEVEL_API_TO_ENUM } from "@/types/roles";
import { AnalyticsControllerGetAnalyticsSeniorityLevelEnum as SeniorityLevel } from "@/sdk";
import { useFetchAnalytics } from "@/hooks/analytics/useFetchAnalytics";
import { AnalyticsControllerGetAnalyticsSelectorTypeEnum as SelectorType } from "@/sdk";

type SeniorityDashboardProps = {
  globalData?: SeniorityListResponseDto;
  isGlobalDataLoading?: boolean;
  filters: FilterState;
  onAddToFilters?: (seniorityLevel: SeniorityLevel) => void;
};

export const SeniorityDashboard = ({
  globalData,
  isGlobalDataLoading,
  filters,
  onAddToFilters,
}: SeniorityDashboardProps) => {
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE[1]);
  const [sortField, setSortField] = useState<SortBy>(SortBy.COUNT);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.DESC);
  const [view, setView] = useState<ViewType>(ViewType.TABLE);
  const [trendFrequency, setTrendFrequency] = useState<TrendFrequency>(
    TrendFrequency.Y5
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pageInput, setPageInput] = useState<string>(String(page));

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  const shouldUseGlobalData = useMemo(() => {
    return (
      page === 1 &&
      itemsPerPage === ITEMS_PER_PAGE[1] &&
      sortField === SortBy.COUNT &&
      sortOrder === SortOrder.DESC &&
      view === ViewType.TABLE &&
      trendFrequency === TrendFrequency.Y5
    );
  }, [page, itemsPerPage, sortField, sortOrder, view, trendFrequency]);

  const { data, isLoading, isFetching } = useFetchAnalytics({
    params: {
      ...filters,
      limit: itemsPerPage,
      sortBy: sortField,
      sortOrder: sortOrder,
      offset: (page - 1) * itemsPerPage,
      includeSeniorityTrend: view === ViewType.TREND,
      selectorType: SelectorType.Seniority,
    },
    options: {
      enabled: !shouldUseGlobalData,
      isInitialLoad: shouldUseGlobalData,
    },
  });

  const currentData = shouldUseGlobalData ? globalData : data?.seniorityData;
  const seniorityLevels = currentData?.seniorityLevels || [];
  const totalItems = currentData?.count || 0;

  const isWaitingForData =
    (shouldUseGlobalData && isGlobalDataLoading) ||
    (!shouldUseGlobalData && (isLoading || isFetching));

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

  const isRowInFilters = (row: SeniorityListItemDto): boolean => {
    return filters.seniorityLevel?.includes(row.name) ?? false;
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
                hoverMessage="The total of alumni roles that match this seniority level"
              />

              {isWaitingForData ? (
                <DashboardSkeleton />
              ) : (
                <TableBody className="bg-white divide-y divide-gray-200">
                  {seniorityLevels.length > 0 ? (
                    seniorityLevels.map(
                      (seniorityLevel: SeniorityListItemDto, index: number) => {
                        const rowNumber = (page - 1) * itemsPerPage + index + 1;
                        const name =
                          SENIORITY_LEVEL_API_TO_ENUM[seniorityLevel.name] ||
                          seniorityLevel.name;

                        return (
                          <CustomTableRow
                            key={seniorityLevel.name}
                            index={index}
                            className="group"
                          >
                            <TableNumberCell rowNumber={rowNumber} />
                            <TableNameCell
                              name={name}
                              isRowInFilters={!!isRowInFilters(seniorityLevel)}
                            />
                            <TableCell
                              className={`w-[12%] px-4 ${
                                view === ViewType.TABLE ? "py-1" : "z"
                              } text-sm ${
                                isRowInFilters(seniorityLevel)
                                  ? "font-bold text-[#8C2D19]"
                                  : "text-[#000000]"
                              } align-middle hover:text-[#8C2D19] transition-colors relative`}
                            >
                              <div className="flex items-center gap-0 justify-center">
                                {view === ViewType.TABLE ? (
                                  <>
                                    <CountComponent
                                      count={seniorityLevel.count}
                                    />
                                    <div
                                      className={`${
                                        isRowInFilters(seniorityLevel)
                                          ? "opacity-100"
                                          : "opacity-0 group-hover:opacity-100"
                                      } transition-opacity ${
                                        view === ViewType.TABLE
                                          ? "ml-2"
                                          : "ml-0"
                                      }`}
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
                                                onAddToFilters?.(
                                                  seniorityLevel.name
                                                )
                                              }
                                            >
                                              <Filter className="h-4 w-4 text-[#8C2D19]" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Filter on {name}</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                  </>
                                ) : (
                                  <TrendLineComponent
                                    dataPoints={seniorityLevel.trend}
                                    trendFrequency={trendFrequency}
                                  />
                                )}
                              </div>
                            </TableCell>
                          </CustomTableRow>
                        );
                      }
                    )
                  ) : (
                    <NotFoundComponent
                      message="No seniority level data available"
                      description="Try adjusting your filters to find seniority levels that match your criteria."
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
          visible={seniorityLevels.length > 0}
          currentCount={seniorityLevels.length}
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
        ) : seniorityLevels.length === 0 ? (
          <NotFoundComponent
            message="No seniority level data available"
            description="Try adjusting your filters to find seniority levels that match your criteria."
            colSpan={4}
          />
        ) : (
          <ChartView
            data={seniorityLevels.map((seniorityLevel) => ({
              name:
                SENIORITY_LEVEL[
                  seniorityLevel.name as keyof typeof SENIORITY_LEVEL
                ] || seniorityLevel.name,
              id: seniorityLevel.name,
              count: seniorityLevel.count,
            }))}
            isLoading={isWaitingForData}
            entityType={EntityType.SENIORITY}
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
            title="Seniority"
            icon={<Trophy className="h-5 w-5 text-[#8C2D19]" />}
            tooltipMessage="Distribution of alumni by the seniority level of their role."
          />
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
