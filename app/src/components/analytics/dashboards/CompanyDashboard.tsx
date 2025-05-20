"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DASHBOARD_HEIGHT, ITEMS_PER_PAGE, SortBy, SortOrder } from "@/consts";
import { useCompanyList } from "@/hooks/analytics/useCompanyList";
import { CompanyListItemDto } from "@/sdk";
import { EntityType, TrendFrequency } from "@/types/entityTypes";
import { ViewType } from "@/types/view";
import { Building2, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import {
  ChartView,
  CountComponent,
  CustomTableHeader,
  CustomTableRow,
  LoadingChart,
  NotFoundComponent,
  PaginationControls,
  TableNameCell,
  TableNumberCell,
  TableTitle,
  TrendLineComponent,
  ViewToggle,
} from "../common";
import { FilterState } from "../common/GlobalFilters";
import { DashboardSkeleton } from "../skeletons/DashboardSkeleton";

type CompanyDashboardProps = {
  onDataUpdate: (
    alumniCount: number,
    companyCount: number,
    alumniFilteredCount: number,
    companyFilteredCount: number
  ) => void;
  filters: FilterState;
  onAddToFilters?: (companyId: string) => void;
};

export const CompanyDashboard = ({
  onDataUpdate,
  filters,
  onAddToFilters,
}: CompanyDashboardProps) => {
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE[1]);
  const [totalItems, setTotalItems] = useState(0);
  const [sortField, setSortField] = useState<SortBy>(SortBy.COUNT);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.DESC);
  const [view, setView] = useState<ViewType>(ViewType.TABLE);
  const [trendFrequency, setTrendFrequency] = useState<TrendFrequency>(
    TrendFrequency.Y5
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pageInput, setPageInput] = useState<string>(String(page));

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const { data, isLoading, isFetching } = useCompanyList({
    ...filters,
    limit: itemsPerPage,
    sortBy: sortField,
    sortOrder: sortOrder,
    offset: (page - 1) * itemsPerPage,
    includeTrend: view === ViewType.TREND,
  });

  const companies = data?.companies || [];

  useEffect(() => {
    if (data) {
      const {
        alumniCount,
        companyCount,
        alumniFilteredCount,
        companyFilteredCount,
      } = data;

      if (
        alumniCount !== undefined &&
        companyCount !== undefined &&
        alumniFilteredCount !== undefined &&
        companyFilteredCount !== undefined
      ) {
        setTotalItems(companyFilteredCount);
        onDataUpdate(
          alumniCount,
          companyCount,
          alumniFilteredCount,
          companyFilteredCount
        );
      }
    }
  }, [data, onDataUpdate]);

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

  const isRowInFilters = (row: CompanyListItemDto): boolean => {
    return filters.companyIds?.includes(row.id) ?? false;
  };

  const renderTableView = () => {
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
                hoverMessage="Alumni who have worked at this company"
              />

              {isLoading || isFetching ? (
                <DashboardSkeleton />
              ) : (
                <TableBody className="bg-white divide-y divide-gray-200">
                  {companies.length > 0 ? (
                    companies.map(
                      (company: CompanyListItemDto, index: number) => {
                        const rowNumber = (page - 1) * itemsPerPage + index + 1;
                        return (
                          <CustomTableRow index={index} key={company.id}>
                            <TableNumberCell rowNumber={rowNumber} />
                            <TableNameCell
                              name={company.name}
                              isRowInFilters={!!isRowInFilters(company)}
                              image={company.logo}
                              imageType="company"
                              pageUrl={`/company/${company.id}`}
                              salaryDataUrl={company.levelsFyiUrl}
                            />
                            <TableCell
                              className={`w-[12%] px-4 ${
                                view === ViewType.TABLE ? "py-1" : "py-3"
                              } text-sm ${
                                isRowInFilters(company)
                                  ? "font-bold text-[#8C2D19]"
                                  : "text-[#000000]"
                              } align-middle hover:text-[#8C2D19] transition-colors relative`}
                            >
                              <div className="flex items-center gap-0 justify-center">
                                {view === ViewType.TABLE ? (
                                  <>
                                    <CountComponent count={company.count} />
                                    <div
                                      className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                                        view === ViewType.TABLE
                                          ? "ml-1"
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
                                                onAddToFilters?.(company.id)
                                              }
                                            >
                                              <Filter className="h-4 w-4 text-[#8C2D19]" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Filter on {company.name}</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                  </>
                                ) : (
                                  <TrendLineComponent
                                    dataPoints={company.trend}
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
                      message="No company data available"
                      description="Try adjusting your filters to find companies that match your criteria."
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
          visible={companies.length > 0}
          currentCount={companies.length}
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
        {isLoading || isFetching ? (
          <LoadingChart />
        ) : companies.length === 0 ? (
          <NotFoundComponent
            message="No company data available"
            description="Try adjusting your filters to find companies that match your criteria."
            colSpan={1}
          />
        ) : (
          <ChartView
            data={companies}
            isLoading={isLoading || isFetching}
            entityType={EntityType.COMPANY}
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
            title="Companies"
            icon={<Building2 className="h-5 w-5 text-[#8C2D19]" />}
            tooltipMessage={`Distribution of alumni by the company they ${
              filters.currentRolesOnly ? "work for" : "have worked at"
            }`}
            className="pl-1"
          />
        </div>

        <div className="border rounded-md overflow-hidden">
          <ViewToggle view={view} setView={setView} />
        </div>
      </div>

      {/* Maybe fix this weird logic */}
      {view === ViewType.TABLE && renderTableView()}
      {view === ViewType.TREND && renderTableView()}
      {view === ViewType.CHART && renderChartView()}
    </div>
  );
};
