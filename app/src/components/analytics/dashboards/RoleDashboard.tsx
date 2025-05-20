"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RoleListItemDto } from "@/sdk";
import { Briefcase, Filter, Info, ExternalLink, CheckIcon } from "lucide-react";

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
import { useRoleList } from "@/hooks/analytics/useRoleList";
import { ViewType } from "@/types/view";
import { EntityType, TrendFrequency } from "@/types/entityTypes";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { ClassificationLevel } from "@/types/roles";
import { ESCO_INFO, ISCO_INFO } from "@/consts";

type RoleDashboardProps = {
  onDataUpdate: (roleCount: number, roleFilteredCount: number) => void;
  filters: FilterState;
  onAddToFilters?: (roleId: string) => void;
};

export const RoleDashboard = ({
  filters,
  onAddToFilters,
  onDataUpdate,
}: RoleDashboardProps) => {
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE[1]);
  const [sortField, setSortField] = useState<SortBy>(SortBy.COUNT);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.DESC);
  const [view, setView] = useState<ViewType>(ViewType.TABLE);
  const [trendFrequency, setTrendFrequency] = useState<TrendFrequency>(
    TrendFrequency.Y5
  );
  const [classificationLevel, setClassificationLevel] =
    useState<ClassificationLevel>(ClassificationLevel.LEVEL_4);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pageInput, setPageInput] = useState<string>(String(page));

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
    escoClassificationLevel: Number(classificationLevel.split(" ")[1]),
  });

  const roles = data?.roles || [];
  const totalRoles = data?.count || 0;
  const totalRolesFiltered = data?.filteredCount || 0;
  const totalItems = data?.distinctCount || 0;

  useEffect(() => {
    if (totalRoles !== undefined) {
      onDataUpdate(totalRoles, totalRolesFiltered);
    }
  }, [totalRoles, totalRolesFiltered, onDataUpdate]);

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

              {isLoading || isFetching ? (
                <DashboardSkeleton />
              ) : (
                <TableBody className="bg-white divide-y divide-gray-200">
                  {roles.length > 0 ? (
                    roles.map((role: RoleListItemDto, index: number) => {
                      const rowNumber = (page - 1) * itemsPerPage + index + 1;
                      return (
                        <CustomTableRow key={role.code} index={index}>
                          <TableNumberCell rowNumber={rowNumber} />
                          <TableNameCell
                            name={role.name}
                            isRowInFilters={!!isRowInFilters(role)}
                          />
                          <TableCell
                            className={`w-[12%] px-4 ${
                              view === ViewType.TABLE ? "py-1" : "py-3"
                            } text-sm ${
                              isRowInFilters(role)
                                ? "font-bold text-[#8C2D19]"
                                : "text-[#000000]"
                            } align-middle hover:text-[#8C2D19] transition-colors relative`}
                          >
                            <div className="flex items-center gap-0 justify-center">
                              {view === ViewType.TABLE ? (
                                <>
                                  <CountComponent count={role.count} />
                                  <div
                                    className={`${
                                      isRowInFilters(role)
                                        ? "opacity-100"
                                        : "opacity-0 group-hover:opacity-100"
                                    } transition-opacity ${
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
            tooltipMessage="Distribution of alumni by the classification of their role."
          />
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2px-2 py-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-w-[90px] justify-start text-left font-medium text-[#000000] border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
                        >
                          {classificationLevel}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="shadow-md rounded-lg border-gray-200">
                        {Object.values(ClassificationLevel).map(
                          (item: ClassificationLevel) => (
                            <DropdownMenuItem
                              key={item}
                              onClick={() => setClassificationLevel(item)}
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
                </TooltipTrigger>
                <TooltipContent>
                  <p>Select ESCO classification grouping</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-5 w-5 text-[#8C2D19]" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs" align="end">
                <div className="space-y-2">
                  <p>
                    <strong>Levels 1-4:</strong> ISCO-08 classification
                    hierarchy
                  </p>
                  <p>
                    <strong>Level 5+:</strong> ESCO occupations that build upon
                    and extend the ISCO structure
                  </p>
                </div>
                <div className="space-y-1">
                  <a
                    href={ISCO_INFO}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-xs font-medium text-blue-500 hover:underline mt-1"
                  >
                    Learn more about the ISCO Classification
                    <ExternalLink className="h-3.5 w-3.5 ml-1" />
                  </a>
                  <a
                    href={ESCO_INFO}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-xs font-medium text-blue-500 hover:underline mt-1"
                  >
                    Learn more about the ESCO Classification
                    <ExternalLink className="h-3.5 w-3.5 ml-1" />
                  </a>
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
