"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useCompanyList } from "@/hooks/analytics/useCompanyList";
import { CompanyListItemDto } from "@/sdk";
import {
  Building2,
  Filter,
  LineChart,
  PieChart,
  TableIcon,
} from "lucide-react";
import ImageWithFallback from "../../ui/image-with-fallback";
import PaginationControls from "../common/PaginationControls";
import { DashboardSkeleton } from "../skeletons/DashboardSkeleton";
import TableTitle from "../common/TableTitle";
import CustomTableHeader from "../common/CustomeTableHeader";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import LoadingChart from "../common/LoadingChart";
import { TrendTooltip } from "../common/TrendTooltip";
import { EntityType, TrendFrequency } from "@/types/entityTypes";
import { TableView } from "../common/TableView";

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
  const [trendFrequency, setTrendFrequency] = useState<TrendFrequency>(TrendFrequency.Y5);

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

  // So ugly, try to fix if time allows
  useEffect(() => {
    if (
      data?.alumniCount !== undefined &&
      data?.companyCount !== undefined &&
      data?.alumniFilteredCount !== undefined &&
      data?.companyFilteredCount !== undefined
    ) {
      setTotalItems(data.companyCount);
      onDataUpdate(
        data.alumniCount,
        data.companyCount,
        data.alumniFilteredCount,
        data.companyFilteredCount
      );
    }
  }, [
    data?.alumniCount,
    data?.companyCount,
    data?.alumniFilteredCount,
    data?.companyFilteredCount,
    onDataUpdate,
  ]);

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
      <TableView
        data={companies}
        isLoading={isLoading}
        isFetching={isFetching}
        page={page}
        setPage={setPage}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        totalItems={totalItems}
        view={view}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
        trendFrequency={trendFrequency}
        setTrendFrequency={setTrendFrequency}
        entityType="Company"
        onAddToFilters={onAddToFilters}
      />
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
            tooltipMessage="Companies that have hired alumni from our programs."
            className="pl-1"
          />

          {view === ViewType.TREND && (
            <TrendTooltip entityType={EntityType.COMPANY} trendFrequency={trendFrequency} />
          )}
        </div>

        <div className="border rounded-md overflow-hidden">
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(value: string) =>
              value && setView(value as ViewType)
            }
            className="flex"
          >
            <ToggleGroupItem
              value={ViewType.TABLE}
              aria-label="Table View"
              className="px-1.5 py-1"
              title="Table View"
            >
              <TableIcon className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value={ViewType.CHART}
              aria-label="Chart View"
              className="px-1.5 py-1 disabled:opacity-10"
              title="Chart View"
            >
              <PieChart className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value={ViewType.TREND}
              aria-label="Trend View"
              className="px-1.5 py-1"
              title="Trend View"
            >
              <LineChart className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* Maybe fix this weird logic */}
      {view === ViewType.TABLE && renderTableView()}
      {view === ViewType.TREND && renderTableView()}
      {view === ViewType.CHART && renderChartView()}
    </div>
  );
}
