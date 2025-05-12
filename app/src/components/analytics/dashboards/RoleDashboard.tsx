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
import { RoleListItemDto } from "@/sdk";
import {
  Briefcase,
  Filter,
  Info,
  ExternalLink,
  TableIcon,
  PieChart,
  LineChart,
} from "lucide-react";

import { DashboardSkeleton } from "../skeletons/DashboardSkeleton";
import PaginationControls from "../common/PaginationControls";
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
import { useRoleList } from "@/hooks/analytics/useRoleList";
import { startCase } from "lodash";
import { Switch } from "@/components/ui/switch";
import ChartView from "../common/ChartView";
import { ViewType } from "@/types/view";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import CountComponent from "../common/CountComponent";
import TrendLineComponent from "../common/TrendLineComponent";
import LoadingChart from "../common/LoadingChart";
import { EntityType, TrendFrequency } from "@/types/entityTypes";
import { TrendTooltip } from "../common/TrendTooltip";

type RoleDashboardProps = {
  onDataUpdate: (roleCount: number, roleFilteredCount: number) => void;
  filters: FilterState;
  onAddToFilters?: (roleId: string) => void;
  onLevelChange: (level: number) => void;
};

export default function RoleDashboard({
  filters,
  onAddToFilters,
  onDataUpdate,
  onLevelChange,
}: RoleDashboardProps) {
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE[1]);
  const [sortField, setSortField] = useState<SortBy>(SortBy.COUNT);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.DESC);
  const [view, setView] = useState<ViewType>(ViewType.TABLE);
  const [level, setLevel] = useState<number>(1);
  const [trendFrequency, setTrendFrequency] = useState<TrendFrequency>(TrendFrequency.Y5);
  

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pageInput, setPageInput] = useState<string>(String(page));

  const onLevelUpdate = (checked: boolean) => {
    const newLevel = checked ? 2 : 1;
    setLevel(newLevel);
    onLevelChange(newLevel);
    onDataUpdate(totalRoles, totalRolesFiltered);
  };

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  const { data, isLoading, isFetching } = useRoleList({
    ...filters,
    limit: itemsPerPage,
    sortBy: sortField,
    sortOrder: sortOrder,
    offset: (page - 1) * itemsPerPage,
    includeTrend: view === ViewType.TREND,
  });

  const roles = data?.roles || [];
  const totalRoles = data?.count || 0;
  const totalRolesFiltered = data?.filteredCount || 0;

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
                useRoleTitle={true}
              />

              {isLoading || isFetching ? (
                <DashboardSkeleton />
              ) : (
                <TableBody className="bg-white divide-y divide-gray-200">
                  {roles.length > 0 ? (
                    roles.map((role: RoleListItemDto, index: number) => {
                      const rowNumber = (page - 1) * itemsPerPage + index + 1;
                      return (
                        <TableRow
                          key={role.code}
                          className={`group ${
                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                          } hover:bg-[#A13A23] hover:bg-opacity-10 transition-colors duration-200 relative`}
                        >
                          <TableCell className="w-1/12 py-1.5 pl-3 text-sm text-gray-500 font-medium align-middle">
                            {rowNumber}
                          </TableCell>
                          <TableCell className="w-5/12 py-1.5 pl-3 text-sm font-medium text-[#000000] align-middle">
                            <Button
                              variant="link"
                              className="text-sm font-medium text-[#000000] w-full text-left h-auto p-1 hover:text-[#8C2D19] transition-colors mr-2"
                              onClick={() => {
                                window.open(`/role/${role.code}`, "_blank");
                              }}
                            >
                              <div
                                title={role.name}
                                className="text-ellipsis overflow-hidden w-full text-left"
                              >
                                {startCase(role.name)}
                              </div>
                            </Button>
                          </TableCell>
                          <TableCell className="w-2/12 px-3 py-1 text-sm text-[#000000] align-middle hover:text-[#8C2D19] transition-colors relative">
                            <div className="flex items-center gap-0 justify-center">
                              {view === ViewType.TABLE ? (
                                <CountComponent count={role.count} />
                              ) : (
                                <TrendLineComponent
                                  dataPoints={role.trend}
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
                            </div>
                          </TableCell>
                        </TableRow>
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
          totalItems={totalRolesFiltered}
          visible={roles.length > 0}
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
          <LoadingChart message="Loading chart data..." />
        ) : roles.length === 0 ? (
          <NotFoundComponent
            message="No industry data available"
            description="Try adjusting your filters to find industries that match your criteria."
            colSpan={1}
          />
        ) : (
          <ChartView
            data={roles.map((role) => ({
              name: role.name,
              id: role.code,
              count: role.count,
            }))}
            isLoading={isLoading || isFetching}
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
            title="Roles"
            icon={<Briefcase className="h-5 w-5 text-[#8C2D19]" />}
          />
          {view === ViewType.TREND && (
            <TrendTooltip entityType={EntityType.ROLE} trendFrequency={trendFrequency} />
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

        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-5 w-5 text-[#8C2D19]" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-2">
                  <p>
                    <strong>Level 1:</strong> More general job classification,
                    maps directly to level 4 of the ESCO taxonomy
                  </p>
                  <p>
                    <strong>Level 2:</strong> More granular classification, maps
                    to lower levels of the ESCO taxonomy (5-7)
                  </p>
                  <a
                    href="https://esco.ec.europa.eu/en/classification/occupation_main"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm font-medium text-blue-500 hover:underline mt-1"
                  >
                    View ESCO Classification
                    <ExternalLink className="h-3.5 w-3.5 ml-1" />
                  </a>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div
            className="flex items-center space-x-2 bg-gray-50 px-2 py-1 rounded-full"
            title="Toggle view mode"
          >
            <span
              className={`text-sm font-medium cursor-pointer ${
                level === 1 ? "text-[#8C2D19] font-semibold" : "text-gray-500"
              }`}
              onClick={() => onLevelUpdate(false)}
            >
              Level 1
            </span>
            <Switch
              id="mode-toggle"
              checked={level === 2}
              onCheckedChange={onLevelUpdate}
            />
            <span
              className={`text-sm font-medium cursor-pointer ${
                level === 2 ? "text-[#8C2D19] font-semibold" : "text-gray-500"
              }`}
              onClick={() => onLevelUpdate(true)}
            >
              Level 2
            </span>
          </div>
        </div>
      </div>

      {view === ViewType.TABLE && renderTable()}
      {view === ViewType.TREND && renderTable()}
      {view === ViewType.CHART && renderChartView()}
    </div>
  );
}
