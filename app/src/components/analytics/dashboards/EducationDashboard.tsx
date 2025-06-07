"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DataPointDto,
  FacultyListDto,
  MajorListDto,
  AnalyticsControllerGetAnalyticsSelectorTypeEnum as SelectorType,
  GraduationListDto,
} from "@/sdk";
import { BookOpen, Building2, Filter, GraduationCap } from "lucide-react";
import { DashboardSkeleton } from "../skeletons/DashboardSkeleton";
import TableTitle from "../common/TableTitle";
import { SortBy, SortOrder, ITEMS_PER_PAGE, DASHBOARD_HEIGHT } from "@/consts";
import { FilterState } from "../common/GlobalFilters";
import {
  NotFoundComponent,
  TrendLineComponent,
  TableNameCell,
  TableNumberCell,
  ViewToggle,
  CountComponent,
  LoadingChart,
  CustomTableRow,
  ChartView,
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { EntityType, TrendFrequency } from "@/types/entityTypes";
import { EducationDrillType } from "@/types/drillType";
import { useFetchAnalytics } from "@/hooks/analytics/useFetchAnalytics";

type EducationData = {
  faculties?: FacultyListDto;
  majors?: MajorListDto;
  graduations?: GraduationListDto;
};

type EducationDashboardProps = {
  globalData?: EducationData;
  isGlobalDataLoading?: boolean;
  filters: FilterState;
  onAddToFilters?: (educationId: string, year?: number) => void;
  mode: EducationDrillType;
  setMode: (mode: EducationDrillType) => void;
};

type DataRowProps = {
  id: string;
  name: string;
  count: number;
  acronym: string;
  year?: number;
  trend?: DataPointDto[];
};

export const EducationDashboard = ({
  globalData,
  isGlobalDataLoading,
  filters,
  onAddToFilters,
  mode,
  setMode,
}: EducationDashboardProps) => {
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

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const needsNewData =
    page > 1 ||
    view === ViewType.TREND ||
    sortField !== SortBy.COUNT ||
    sortOrder !== SortOrder.DESC ||
    itemsPerPage !== ITEMS_PER_PAGE[1];

  const {
    data,
    isLoading: isEducationLoading,
    isFetching: isEducationFetching,
  } = useFetchAnalytics({
    params: {
      limit: itemsPerPage,
      offset: (page - 1) * itemsPerPage,
      sortBy: mode === EducationDrillType.FACULTY ? sortField : undefined,
      sortOrder: mode === EducationDrillType.FACULTY ? sortOrder : undefined,
      selectorType: SelectorType.Education,
      includeEducationTrend:
        mode === EducationDrillType.FACULTY
          ? view === ViewType.TREND
          : undefined,
    },
    options: {
      enabled: needsNewData,
      isInitialLoad: !needsNewData,
    },
  });

  const shouldUseGlobalData =
    !needsNewData &&
    !data?.majorData &&
    !data?.graduationData &&
    !data?.facultyData;

  const currentFacultiesData = shouldUseGlobalData
    ? globalData?.faculties
    : data?.facultyData;
  const currentMajorsData = shouldUseGlobalData
    ? globalData?.majors
    : data?.majorData;
  const currentGraduationsData = shouldUseGlobalData
    ? globalData?.graduations
    : data?.graduationData;

  /* Faculty */
  const faculties = currentFacultiesData?.faculties || [];
  // useful if we add this info in the stats
  //const facultyCount = facultyData?.count || 0;
  const totalFaculties = currentFacultiesData?.count || 0;

  /* Majors */
  const majors = currentMajorsData?.majors || [];
  // useful if we add this info in the stats
  //const majorCount = majorsData?.count || 0;
  const totalMajors = currentMajorsData?.count || 0;

  /* Graduations */
  const graduations = currentGraduationsData?.graduations || [];
  // useful if we add this info in the stats
  //const graduationCount = graduationsData?.count || 0;
  const totalGraduations = currentGraduationsData?.count || 0;

  const isWaitingForData =
  (shouldUseGlobalData && isGlobalDataLoading) ||
  (!shouldUseGlobalData && (isEducationLoading || isEducationFetching));

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

  const getDataByMode = () => {
    if (mode === EducationDrillType.FACULTY) {
      return faculties;
    } else if (mode === EducationDrillType.MAJOR) {
      return majors;
    }
    return graduations;
  };

  const getTableTitle = () => {
    if (mode === EducationDrillType.FACULTY) {
      return "Faculties";
    } else if (mode === EducationDrillType.MAJOR) {
      return "Courses";
    }
    return "Graduation Years";
  };

  const getTableIcon = () => {
    if (mode === EducationDrillType.FACULTY) {
      return <Building2 className="h-5 w-5 text-[#8C2D19]" />;
    } else if (mode === EducationDrillType.MAJOR) {
      return <BookOpen className="h-5 w-5 text-[#8C2D19]" />;
    }
    return <GraduationCap className="h-5 w-5 text-[#8C2D19]" />;
  };

  const getTooltipMessage = () => {
    if (mode === EducationDrillType.FACULTY) {
      return "Distribution of alumni by their graduation faculty.";
    } else if (mode === EducationDrillType.MAJOR) {
      return "Distribution of alumni by their graduation major.";
    }
    return "Distribution of alumni by their graduation year.";
  };

  const getTotalItems = () => {
    if (mode === EducationDrillType.FACULTY) {
      return totalFaculties;
    } else if (mode === EducationDrillType.MAJOR) {
      return totalMajors;
    }
    return totalGraduations;
  };

  const isRowInFilters = (row: DataRowProps): boolean => {
    if (mode === EducationDrillType.FACULTY) {
      return filters.facultyIds?.includes(row.id) ?? false;
    } else if (mode === EducationDrillType.MAJOR) {
      return filters.courseIds?.includes(row.id) ?? false;
    }
    return (
      (filters.graduationYears?.includes(String(row.year ?? 0)) &&
        filters.courseIds?.includes(row.id)) ??
      false
    );
  };

  const handleLocalAddToFilters = (row: DataRowProps) => {
    if (mode === EducationDrillType.YEAR) {
      // For year, we add both the yeaer and course id
      onAddToFilters?.(row.id, row.year);
    } else {
      // Faculty or Course, we add the id directly
      onAddToFilters?.(row.id);
    }
  };

  const getHoverMessage = () => {
    if (mode === EducationDrillType.FACULTY) {
      return "Alumni who have graduated from this faculty";
    } else if (mode === EducationDrillType.MAJOR) {
      return "Alumni who have graduated from this course";
    }
    return "Alumni who have graduated in this year";
  };

  const renderTableView = () => {
    const data = getDataByMode();
    console.log("data", data);

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
                extraHeaderName={
                  mode === EducationDrillType.YEAR ? "Year" : undefined
                }
                customAlumniHeader="Graduates"
                hoverMessage={getHoverMessage()}
              />

              {isWaitingForData ? (
                <DashboardSkeleton
                  hasExtraColumn={mode === EducationDrillType.YEAR}
                />
              ) : (
                <TableBody className="bg-white divide-y divide-gray-200">
                  {data.length > 0 ? (
                    data.map((item: DataRowProps, index: number) => {
                      const rowNumber = (page - 1) * itemsPerPage + index + 1;
                      return (
                        <CustomTableRow
                          index={index}
                          key={
                            mode === EducationDrillType.YEAR
                              ? `${item.id}-${item.year}`
                              : item.id
                          }
                        >
                          <TableNumberCell rowNumber={rowNumber} />
                          <TableNameCell
                            name={item.name}
                            acronym={item.acronym}
                            isRowInFilters={!!isRowInFilters(item)}
                          />
                          {mode === EducationDrillType.YEAR && (
                            <TableCell
                              className={`w-[15%] px-3 py-1.5 text-sm text-[#000000] align-middle text-center ${
                                isRowInFilters(item)
                                  ? "font-bold text-[#8C2D19]"
                                  : "text-[#000000]"
                              }`}
                            >
                              {view === ViewType.TABLE ? (
                                <CountComponent count={item.year ?? 0} />
                              ) : (
                                <TrendLineComponent
                                  dataPoints={item.trend || []}
                                  trendFrequency={trendFrequency}
                                />
                              )}
                            </TableCell>
                          )}
                          <TableCell
                            className={`w-[12%] px-4 ${
                              view === ViewType.TABLE ? "py-1" : "py-3"
                            } text-sm ${
                              isRowInFilters(item)
                                ? "font-bold text-[#8C2D19]"
                                : "text-[#000000]"
                            } align-middle hover:text-[#8C2D19] transition-colors relative`}
                          >
                            <div className="flex items-center gap-0 justify-center">
                              {view === ViewType.TABLE ? (
                                <>
                                  <CountComponent count={item.count} />
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
                                              handleLocalAddToFilters(item)
                                            }
                                          >
                                            <Filter className="h-4 w-4 text-[#8C2D19]" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          {mode === EducationDrillType.YEAR ? (
                                            <p>
                                              Filter on {item.acronym} -{" "}
                                              {item.year}
                                            </p>
                                          ) : (
                                            <p>Filter on {item.acronym}</p>
                                          )}
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                </>
                              ) : (
                                <TrendLineComponent
                                  dataPoints={item.trend || []}
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
                      message="No data available"
                      description="Try adjusting your filters to find data that match your criteria."
                      colSpan={mode === EducationDrillType.YEAR ? 4 : 3}
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
          totalItems={getTotalItems()}
          visible={data.length > 0}
          currentCount={data.length}
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
        {mode === EducationDrillType.FACULTY ? (
          isWaitingForData ? (
            <LoadingChart message="Loading chart data..." />
          ) : faculties.length === 0 ? (
            <NotFoundComponent
              message="No faculty data available"
              description="Try adjusting your filters to find faculties that match your criteria."
              colSpan={1}
            />
          ) : (
            <ChartView
              data={faculties}
              isLoading={isWaitingForData}
              entityType={EntityType.FACULTY}
            />
          )
        ) : mode === EducationDrillType.MAJOR ? (
          isWaitingForData ? (
            <LoadingChart message="Loading chart data..." />
          ) : majors.length === 0 ? (
            <NotFoundComponent
              message="No major data available"
              description="Try adjusting your filters to find majors that match your criteria."
              colSpan={1}
            />
          ) : (
            <ChartView
              data={majors}
              isLoading={isWaitingForData}
              entityType={EntityType.MAJOR}
            />
          )
        ) : isWaitingForData ? (
          <LoadingChart message="Loading chart data..." />
        ) : graduations.length === 0 ? (
          <NotFoundComponent
            message="No graduation data available"
            description="Try adjusting your filters to find graduation data that match your criteria."
            colSpan={1}
          />
        ) : (
          <ChartView
            data={graduations}
            isLoading={isWaitingForData}
            entityType={EntityType.YEAR}
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
            title={getTableTitle()}
            icon={getTableIcon()}
            tooltipMessage={getTooltipMessage()}
            className="pl-1"
          />
        </div>
        <div className="flex items-center space-x-2">
          <ToggleGroup
            type="single"
            value={mode}
            onValueChange={(value: string) =>
              value && setMode(value as EducationDrillType)
            }
            className="flex gap-1 group bg-gray-50 p-0.5 rounded-lg"
          >
            <ToggleGroupItem
              value={EducationDrillType.FACULTY}
              aria-label="Faculty View"
              className="px-2 py-1 text-sm data-[state=on]:bg-gradient-to-r data-[state=on]:from-[#8C2D19] data-[state=on]:to-[#A13A28] data-[state=on]:text-white data-[state=on]:shadow-[0_0_8px_rgba(140,45,25,0.5)] hover:scale-105 transition-all duration-200 ease-in-out data-[state=off]:bg-white data-[state=off]:border data-[state=off]:border-gray-200 hover:data-[state=off]:bg-gray-100"
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 mr-1 inline-block transition-transform duration-200 hover:rotate-12" />
                      <span>F</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {mode === EducationDrillType.FACULTY
                        ? "Distribution by Faculty"
                        : "Change to Faculty view"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </ToggleGroupItem>
            <ToggleGroupItem
              value={EducationDrillType.MAJOR}
              aria-label="Major View"
              className="px-2 py-1 text-sm data-[state=on]:bg-gradient-to-r data-[state=on]:from-[#8C2D19] data-[state=on]:to-[#A13A28] data-[state=on]:text-white data-[state=on]:shadow-[0_0_8px_rgba(140,45,25,0.5)] hover:scale-105 transition-all duration-200 ease-in-out data-[state=off]:bg-white data-[state=off]:border data-[state=off]:border-gray-200 hover:data-[state=off]:bg-gray-100 disabled:opacity-50"
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1 inline-block transition-transform duration-200 hover:bounce" />
                      <span>C</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {mode === EducationDrillType.MAJOR
                        ? "Distribution by Course"
                        : "Change to Course view"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </ToggleGroupItem>
            <ToggleGroupItem
              value={EducationDrillType.YEAR}
              disabled={view === ViewType.TREND}
              aria-label="Year View"
              className="px-2 py-1 text-sm data-[state=on]:bg-gradient-to-r data-[state=on]:from-[#8C2D19] data-[state=on]:to-[#A13A28] data-[state=on]:text-white data-[state=on]:shadow-[0_0_8px_rgba(140,45,25,0.5)] hover:scale-105 transition-all duration-200 ease-in-out data-[state=off]:bg-white data-[state=off]:border data-[state=off]:border-gray-200 hover:data-[state=off]:bg-gray-100 disabled:opacity-50"
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <GraduationCap className="h-4 w-4 mr-1 inline-block transition-transform duration-200 hover:bounce" />
                      <span>Y</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {mode === EducationDrillType.YEAR
                        ? "Distribution by Graduation Year"
                        : "Change to Graduation Year view"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="border rounded-md overflow-hidden">
          <ViewToggle
            view={view}
            setView={setView}
            isTrendViewDisabled={mode === EducationDrillType.YEAR}
          />
        </div>
      </div>

      {view === ViewType.TABLE && renderTableView()}
      {view === ViewType.TREND && renderTableView()}
      {view === ViewType.CHART && renderChartView()}
    </div>
  );
};
