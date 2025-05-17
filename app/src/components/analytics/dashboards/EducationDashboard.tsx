"use client";

import { useEffect, useState  } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DataPointDto } from "@/sdk";
import { BookOpen, Building2, Filter, GraduationCap } from "lucide-react";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import LoadingChart from "../common/LoadingChart";
import { TrendTooltip } from "../common/TrendTooltip";
import { EntityType, TrendFrequency } from "@/types/entityTypes";
import CustomTableRow from "../common/CustomTableRow";
import { useFacultyList } from "@/hooks/analytics/useFacultyList";
import { useMajorsList } from "@/hooks/analytics/useMajorsList";
import { useGraduationList } from "@/hooks/analytics/useGraduationList";
import { EducationDrillType } from "@/types/drillType";
import ViewToggle from "../common/ViewToggle";

type EducationDashboardProps = {
  filters: FilterState;
  onAddToFilters?: (companyId: string) => void;
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

export default function EducationDashboard({
  filters,
  onAddToFilters,
  mode,
  setMode,
}: EducationDashboardProps) {
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

  const {
    data: facultyData,
    isLoading: isFacultyLoading,
    isFetching: isFacultyFetching,
  } = useFacultyList({
    ...filters,
    limit: itemsPerPage,
    sortBy: sortField,
    sortOrder: sortOrder,
    offset: (page - 1) * itemsPerPage,
    includeTrend: view === ViewType.TREND,
    // Let's not overwhelm the server with requests
  }, mode === EducationDrillType.FACULTY);

  const {
    data: majorsData,
    isLoading: isMajorsLoading,
    isFetching: isMajorsFetching,
  } = useMajorsList({
    ...filters,
    limit: itemsPerPage,
    sortBy: sortField,
    sortOrder: sortOrder,
    offset: (page - 1) * itemsPerPage,
    includeTrend: view === ViewType.TREND,
    // Let's not overwhelm the server with requests
  }, mode === EducationDrillType.MAJOR);

  const {
    data: graduationsData,
    isLoading: isGraduationsLoading,
    isFetching: isGraduationsFetching,
  } = useGraduationList({
    ...filters,
    limit: itemsPerPage,
    sortBy: sortField,
    sortOrder: sortOrder,
    offset: (page - 1) * itemsPerPage,
    includeTrend: view === ViewType.TREND,
    // Let's not overwhelm the server with requests
  }, mode === EducationDrillType.YEAR);

  /* Faculty */
  const faculties = facultyData?.faculties || [];
  // useful if we add this info in the stats
  //const facultyCount = facultyData?.count || 0;
  const facultyFilteredCount = facultyData?.filteredCount || 0;

  /* Majors */
  const majors = majorsData?.majors || [];
  // useful if we add this info in the stats
  //const majorCount = majorsData?.count || 0;
  const majorFilteredCount = majorsData?.filteredCount || 0;

  /* Graduations */
  const graduations = graduationsData?.graduations || [];
  // useful if we add this info in the stats
  //const graduationCount = graduationsData?.count || 0;
  const graduationFilteredCount = graduationsData?.filteredCount || 0;
  

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

  const isDomainLoading = () => {
    if (mode === EducationDrillType.FACULTY) {
      return isFacultyLoading || isFacultyFetching;
    } else if (mode === EducationDrillType.MAJOR) {
      return isMajorsLoading || isMajorsFetching;
    }
    return isGraduationsLoading || isGraduationsFetching;
  }

  const getTotalItems = () => {
    if (mode === EducationDrillType.FACULTY) {
      return facultyFilteredCount;
    } else if (mode === EducationDrillType.MAJOR) {
      return majorFilteredCount;
    }
    return graduationFilteredCount;
  }

  const renderTableView = () => {
    const data = getDataByMode();
    const isLoading = isDomainLoading();

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
              />

              {isLoading ? (
                <DashboardSkeleton
                  hasExtraColumn={mode === EducationDrillType.YEAR}
                />
              ) : (
                <TableBody className="bg-white divide-y divide-gray-200">
                  {data.length > 0 ? (
                    data.map((item: DataRowProps, index: number) => {
                      const rowNumber = (page - 1) * itemsPerPage + index + 1;
                      return (
                        <CustomTableRow index={index} key={item.id}>
                          <TableCell className="w-[3%] py-1.5 pl-3 text-sm text-gray-500 font-medium align-middle">
                            {rowNumber}
                          </TableCell>
                          <TableCell className="w-[85%] py-1.5 pl-4 text-sm font-medium text-[#000000] flex items-center gap-1 align-middle">
                            <div className="text-ellipsis overflow-hidden w-full text-left">
                              <div className="text-ellipsis overflow-hidden w-full text-left">
                                <span className="font-semibold">
                                  {item.acronym}
                                </span>
                                {" - "}
                                <span className="font-normal">{item.name}</span>
                              </div>
                            </div>
                          </TableCell>
                          {mode === EducationDrillType.YEAR && (
                            <TableCell className="w-[6%] px-3 py-1-5 text-sm text-[#000000] align-middle hover:text-[#8C2D19] transition-colors relative">
                              <div className="flex items-center gap-0 justify-center">
                                {view === ViewType.TABLE ? (
                                  <CountComponent count={item.year ?? 0} />
                                ) : (
                                  <TrendLineComponent
                                    dataPoints={item.trend || []}
                                    trendFrequency={trendFrequency}
                                  />
                                )}
                                <div
                                  className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                                    view === ViewType.TABLE ? "ml-2" : "ml-0"
                                  }`}
                                ></div>
                              </div>
                            </TableCell>
                          )}
                          <TableCell className="w-[6%] px-3 py-1-5 text-sm text-[#000000] align-middle hover:text-[#8C2D19] transition-colors relative">
                            <div className="flex items-center gap-0 justify-center">
                              {view === ViewType.TABLE ? (
                                <CountComponent count={item.count} />
                              ) : (
                                <TrendLineComponent
                                  dataPoints={item.trend || []}
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
                                          onAddToFilters?.(item.id)
                                        }
                                      >
                                        <Filter className="h-4 w-4 text-[#8C2D19]" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Filter on {item.name}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                          </TableCell>
                        </CustomTableRow>
                      );
                    })
                  ) : (
                    <NotFoundComponent
                      message="No data available"
                      description="Try adjusting your filters to find data that match your criteria."
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
          isDomainLoading() ? (
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
              isLoading={isDomainLoading()}
              entityType={EntityType.FACULTY}
            />
          )
        ) : mode === EducationDrillType.MAJOR ? (
          isDomainLoading() ? (
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
              isLoading={isDomainLoading()}
              entityType={EntityType.MAJOR}
            />
          )
        ) : isDomainLoading() ? (
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
            isLoading={isDomainLoading()}
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

          {view === ViewType.TREND && (
            <TrendTooltip
              entityType={
                mode === EducationDrillType.FACULTY
                  ? EntityType.FACULTY
                  : EntityType.MAJOR
              }
              trendFrequency={trendFrequency}
            />
          )}
        </div>

        <div className="border rounded-md overflow-hidden">
          <ViewToggle
            view={view}
            setView={setView}
            disabled={mode === EducationDrillType.YEAR}
          />
        </div>

        <div className="flex items-center space-x-2  px-2 ">
          <ToggleGroup
            type="single"
            value={mode}
            onValueChange={(value: string) =>
              value && setMode(value as EducationDrillType)
            }
            className="flex gap-1 group"
          >
            <ToggleGroupItem
              value={EducationDrillType.FACULTY}
              aria-label="Faculty View"
              className="px-2 py-1 text-sm data-[state=on]:bg-gradient-to-r data-[state=on]:from-[#8C2D19] data-[state=on]:to-[#A13A28] data-[state=on]:text-white data-[state=on]:shadow-md hover:scale-105 transition-all duration-200 ease-in-out data-[state=off]:bg-gray-100 data-[state=off]:border data-[state=off]:border-gray-300"
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 mr-1 inline-block transition-transform duration-200" />
                      <span>F</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View distribution by Faculty</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </ToggleGroupItem>
            <ToggleGroupItem
              value={EducationDrillType.MAJOR}
              aria-label="Major View"
              className="px-2 py-1 text-sm data-[state=on]:bg-gradient-to-r data-[state=on]:from-[#8C2D19] data-[state=on]:to-[#A13A28] data-[state=on]:text-white data-[state=on]:shadow-md hover:scale-105 transition-all duration-200 ease-in-out data-[state=off]:bg-gray-100 data-[state=off]:border data-[state=off]:border-gray-300"
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1 inline-block transition-transform duration-200" />
                      <span>C</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View distribution by Course</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </ToggleGroupItem>
            <ToggleGroupItem
              value={EducationDrillType.YEAR}
              aria-label="Year View"
              className="px-2 py-1 text-sm data-[state=on]:bg-gradient-to-r data-[state=on]:from-[#8C2D19] data-[state=on]:to-[#A13A28] data-[state=on]:text-white data-[state=on]:shadow-md hover:scale-105 transition-all duration-200 ease-in-out data-[state=off]:bg-gray-100 data-[state=off]:border data-[state=off]:border-gray-300"
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <GraduationCap className="h-4 w-4 mr-1 inline-block transition-transform duration-200" />
                      <span>Y</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View distribution by Graduation Year</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {view === ViewType.TABLE && renderTableView()}
      {view === ViewType.TREND && renderTableView()}
      {view === ViewType.CHART && renderChartView()}
    </div>
  );
}
