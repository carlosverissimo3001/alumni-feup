"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { IndustryListItemDto } from "@/sdk";
import { Factory, Filter, TrendingUp, TrendingDown, Info } from "lucide-react";
import { DashboardSkeleton } from "../skeletons/DashboardSkeleton";
import { useIndustryList } from "@/hooks/analytics/useIndustryList";
import {
  PaginationControls,
  TableTitle,
  CustomTableHeader,
  NotFoundComponent,
  TrendLineComponent,
  ChartView,
  CountComponent,
  LoadingChart,
  CustomTableRow,
  TableNameCell,
  TableNumberCell,
  ViewToggle,
} from "../common";
import { SortBy, SortOrder, ITEMS_PER_PAGE, DASHBOARD_HEIGHT } from "@/consts";
import { FilterState } from "../common/GlobalFilters";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ViewType } from "@/types/view";
import { TrendFrequency, EntityType } from "@/types/entityTypes";

type IndustryDashboardProps = {
  onDataUpdate: (industryCount: number, industryFilteredCount: number) => void;
  filters: FilterState;
  onAddToFilters?: (industryId: string) => void;
};

export const IndustryDashboard = ({
  onDataUpdate,
  filters,
  onAddToFilters,
}: IndustryDashboardProps) => {
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

  const { data, isLoading, isFetching } = useIndustryList({
    ...filters,
    limit: itemsPerPage,
    sortBy: sortField,
    sortOrder: sortOrder,
    offset: (page - 1) * itemsPerPage,
    includeTrend: view === ViewType.TREND,
  });

  const industries = data?.industries || [];
  const totalItems = data?.filteredCount || 0;

  // Update parent only when total changes
  useEffect(() => {
    if (data?.count !== undefined) {
      onDataUpdate(data.count, data.filteredCount);
    }
  }, [data?.count, data?.filteredCount, onDataUpdate]);

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

  const isRowInFilters = (row: IndustryListItemDto): boolean => {
    return filters.industryIds?.includes(row.id) ?? false;
  };

  // Table View Component
  const renderTableView = () => (
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
            />

            {isLoading || isFetching ? (
              <DashboardSkeleton />
            ) : (
              <TableBody className="bg-white divide-y divide-gray-200">
                {industries.length > 0 ? (
                  industries.map(
                    (industry: IndustryListItemDto, index: number) => {
                      const rowNumber = (page - 1) * itemsPerPage + index + 1;
                      return (
                        <CustomTableRow key={industry.id} index={index}>
                          <TableNumberCell rowNumber={rowNumber} />
                          <TableNameCell
                            name={industry.name}
                            isRowInFilters={!!isRowInFilters(industry)}
                          />
                          <TableCell
                            className={`w-[12%] px-4 ${
                              view === ViewType.TABLE ? "py-1" : ""
                            } text-sm ${
                              isRowInFilters(industry)
                                ? "font-bold text-[#8C2D19]"
                                : "text-[#000000]"
                            } align-middle hover:text-[#8C2D19] transition-colors relative`}
                          >
                            <div className="flex items-center gap-0 justify-center">
                              {view === ViewType.TABLE ? (
                                <>
                                  <CountComponent count={industry.count} />
                                  <div
                                    className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                                      view === ViewType.TABLE ? "ml-2" : "ml-0"
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
                                              onAddToFilters?.(industry.id)
                                            }
                                          >
                                            <Filter className="h-4 w-4 text-[#8C2D19]" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Filter on {industry.name}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                </>
                              ) : (
                                <TrendLineComponent
                                  dataPoints={industry.trend}
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
                    message="No industry data available"
                    description="Try adjusting your filters to find industries that match your criteria."
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
        visible={industries.length > 0}
        currentCount={industries.length}
        showTrendFrequency={view === ViewType.TREND}
        trendFrequency={trendFrequency}
        setTrendFrequency={setTrendFrequency}
      />
    </>
  );

  // Chart View Component
  const renderChartView = () => (
    <div className="flex-1 flex flex-col border-t border-b border-gray-200 overflow-hidden">
      <div className="flex-1 flex items-center justify-center">
        {isLoading || isFetching ? (
          <LoadingChart message="Loading chart data..." />
        ) : industries.length === 0 ? (
          <NotFoundComponent
            message="No industry data available"
            description="Try adjusting your filters to find industries that match your criteria."
            colSpan={1}
          />
        ) : (
          <ChartView
            data={industries}
            isLoading={isLoading || isFetching}
            entityType={EntityType.INDUSTRY}
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
            title="Industries"
            icon={<Factory className="h-5 w-5 text-[#8C2D19]" />}
            className="pl-1"
            tooltipMessage="Distribution of alumni by the industry of their role."
          />

          {view === "trend" && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-5 w-5 text-[#8C2D19] ml-2" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs" align="start">
                  <div className="space-y-2">
                    <p>
                      <strong>Trend View:</strong> Shows the change in industry
                      presence over the past 5 years
                    </p>
                    <p>
                      <TrendingUp className="h-3.5 w-3.5 inline text-green-500 mr-1" />{" "}
                      Indicates growing industries
                    </p>
                    <p>
                      <TrendingDown className="h-3.5 w-3.5 inline text-red-500 mr-1" />{" "}
                      Indicates declining industries
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <div className="border rounded-md overflow-hidden">
          <div className="border rounded-md overflow-hidden">
            <ViewToggle view={view} setView={setView} />
          </div>
        </div>
      </div>

      {/* Maybe fix this weird logic */}
      {view === ViewType.TABLE && renderTableView()}
      {view === ViewType.TREND && renderTableView()}
      {view === ViewType.CHART && renderChartView()}
    </div>
  );
};
