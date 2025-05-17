"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useCompanyList } from "@/hooks/analytics/useCompanyList";
import { CompanyListItemDto } from "@/sdk";
import {
  Building2,
  DollarSign,
  Filter,
} from "lucide-react";
import ImageWithFallback from "../../ui/image-with-fallback";
import PaginationControls from "../common/PaginationControls";
import { DashboardSkeleton } from "../skeletons/DashboardSkeleton";
import TableTitle from "../common/TableTitle";
import CustomTableHeader from "../common/CustomTableHeader";
import { SortBy, SortOrder, ITEMS_PER_PAGE, DASHBOARD_HEIGHT } from "@/consts";
import { FilterState } from "../common/GlobalFilters";
import { NotFoundComponent } from "../common/NotFoundComponent";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ChartView from "../common/ChartView";
import { ViewType } from "@/types/view";
import CountComponent from "../common/CountComponent";
import TrendLineComponent from "../common/TrendLineComponent";
import LoadingChart from "../common/LoadingChart";
import { TrendTooltip } from "../common/TrendTooltip";
import { EntityType, TrendFrequency } from "@/types/entityTypes";
import CustomTableRow from "../common/CustomTableRow";
import ViewToggle from "../common/ViewToggle";

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

export default function CompanyDashboard({
  onDataUpdate,
  filters,
  onAddToFilters,
}: CompanyDashboardProps) {
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
                            <TableCell className="w-[3%] py-1.5 pl-3 text-sm text-gray-500 font-medium align-middle">
                              {rowNumber}
                            </TableCell>
                            <TableCell className="w-[85%] py-1.5 pl-3 text-sm font-medium text-[#000000] flex items-center gap-1 align-middle">
                              <div className="min-w-[24px] w-6 h-6 mr-1.5 rounded-full overflow-hidden flex items-center justify-center bg-gray-50">
                                <ImageWithFallback
                                  src={company.logo || ""}
                                  alt={company.name}
                                  width={24}
                                  height={24}
                                  className="rounded-full object-contain w-full h-full"
                                />
                              </div>
                              <div
                                className="flex items-center gap-2 flex-1"
                              >
                                <Button
                                  variant="link"
                                  className="text-sm font-medium text-[#000000] text-left h-auto p-1 hover:text-[#8C2D19] transition-colors flex items-center group-hover:text-[#8C2D19]"
                                  onClick={() => {
                                    window.open(
                                      `/company/${company.id}`,
                                      "_blank"
                                    );
                                  }}
                                >
                                  <div
                                    title={`Go to ${company.name}'s profile`}
                                    className="text-ellipsis overflow-hidden w-full text-left"
                                  >
                                    {company.name}
                                  </div>
                                </Button>
                                {company.levelsFyiUrl && (
                                  <div
                                    title={`View Salary Insights on Levels.fyi for ${company.name}`}
                                  >
                                    <DollarSign
                                      className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-[#8C2D19]"
                                      onClick={() => {
                                      window.open(
                                        company.levelsFyiUrl,
                                        "_blank"
                                      );
                                    }}
                                  />
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="w-[12%] px-3 py-1 text-sm text-[#000000] align-middle hover:text-[#8C2D19] transition-colors relative">
                              <div className="flex items-center gap-0 justify-center">
                                {view === ViewType.TABLE ? (
                                  <CountComponent count={company.count} />
                                ) : (
                                  <TrendLineComponent
                                    dataPoints={company.trend}
                                    trendFrequency={trendFrequency}
                                  />
                                )}
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

          {view === ViewType.TREND && (
            <TrendTooltip
              entityType={EntityType.COMPANY}
              trendFrequency={trendFrequency}
            />
          )}
        </div>

        <div className="border rounded-md overflow-hidden">
          <ViewToggle
            view={view}
            setView={setView}
          />
        </div>
      </div>

      {/* Maybe fix this weird logic */}
      {view === ViewType.TABLE && renderTableView()}
      {view === ViewType.TREND && renderTableView()}
      {view === ViewType.CHART && renderChartView()}
    </div>
  );
}
