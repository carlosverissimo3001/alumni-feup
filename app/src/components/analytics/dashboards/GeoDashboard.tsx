"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import {
  CityListResponseDto,
  CountryListResponseDto,
  DataPointDto,
  AnalyticsControllerGetAnalyticsSelectorTypeEnum as SelectorType,
} from "@/sdk";
import { GEO_DRILL_TYPE } from "@/types/drillType";
import { EntityType, TrendFrequency } from "@/types/entityTypes";
import { ViewType } from "@/types/view";
import { Filter, Flag, MapPin } from "lucide-react";
import {
  ChartView,
  CountComponent,
  CustomTableHeader,
  PaginationControls,
  CustomTableRow,
  LoadingChart,
  NotFoundComponent,
  TableNameCell,
  TableNumberCell,
  ViewToggle,
} from "../common/";
import { FilterState } from "../common/GlobalFilters";
import TableTitle from "../common/TableTitle";
import TrendLineComponent from "../common/TrendLineComponent";
import { DashboardSkeleton } from "../skeletons/DashboardSkeleton";
import { useFetchAnalytics } from "@/hooks/analytics/useFetchAnalytics";
import { capitalize } from "lodash";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// Types

type GeoData = {
  countryData?: CountryListResponseDto;
  cityData?: CityListResponseDto;
};

type GeoDashboardProps = {
  globalData?: GeoData;
  isGlobalDataLoading?: boolean;
  onDataUpdate: (countryCount: number) => void;
  filters: FilterState;
  onAddToFilters?: (id: string, type: "role" | "company") => void;
  mode: GEO_DRILL_TYPE;
  setMode: (mode: GEO_DRILL_TYPE) => void;
};

type DataRowProps = {
  id: string;
  code: string;
  name: string;
  count: number;
  trend: DataPointDto[];
  latitude?: number;
  longitude?: number;
};

export const GeoDashboard = ({
  globalData,
  isGlobalDataLoading,
  onDataUpdate,
  filters,
  onAddToFilters,
  mode,
  setMode,
}: GeoDashboardProps) => {
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
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

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
    isLoading: isGeoLoading,
    isFetching: isGeoFetching,
  } = useFetchAnalytics({
    params: {
      ...filters,
      limit: itemsPerPage,
      sortBy: sortField,
      sortOrder: sortOrder,
      offset: (page - 1) * itemsPerPage,
      includeGeoTrend: view === ViewType.TREND,
      selectorType: SelectorType.Geo,
    },
    options: {
      enabled: needsNewData,
    },
  });

  const shouldUseGlobalData =
    !needsNewData && !data?.countryData && !data?.cityData;

  const currentCountriesData = shouldUseGlobalData
    ? globalData?.countryData
    : data?.countryData;
  const currentCitiesData = shouldUseGlobalData
    ? globalData?.cityData
    : data?.cityData;

  const countries = currentCountriesData?.countries || [];
  const cities = currentCitiesData?.cities || [];

  const totalCountries = currentCountriesData?.count || 0;
  const totalCities = currentCitiesData?.count || 0;

  useEffect(() => {
    onDataUpdate(totalCountries);
  }, [totalCountries, onDataUpdate]);

  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  const isWaitingForData =
    (shouldUseGlobalData && isGlobalDataLoading) ||
    (!shouldUseGlobalData && (isGeoLoading || isGeoFetching));

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
    const data = mode === GEO_DRILL_TYPE.COUNTRY ? countries : cities;

    const isRowInFilters = (row: DataRowProps, type?: "role" | "company") => {
      if (type === "role") {
        return filters.roleCountryCodes?.includes(row.id);
      } else if (type === "company") {
        return filters.companyHQsCountryCodes?.includes(row.id);
      }

      return (
        filters.roleCountryCodes?.includes(row.id) ||
        filters.companyHQsCountryCodes?.includes(row.id)
      );
    };

    const buildMapUrl = (
      latitude?: number,
      longitude?: number
    ): string | undefined => {
      if (!latitude || !longitude) {
        return undefined;
      }
      return `/?lat=${latitude}&lng=${longitude}&group_by=${mode}`;
    };

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
                hoverMessage="Alumni that have had at least a role in this location"
              />

              {isWaitingForData ? (
                <DashboardSkeleton />
              ) : (
                <TableBody className="bg-white divide-y divide-gray-200">
                  {data.length > 0 ? (
                    data.map((row: DataRowProps, index: number) => {
                      const rowNumber = (page - 1) * itemsPerPage + index + 1;
                      const flagUrl = row.code
                        ? `https://flagcdn.com/${row.code.toLowerCase()}.svg`
                        : "";
                      return (
                        <CustomTableRow index={index} key={row.id}>
                          <TableNumberCell rowNumber={rowNumber} />
                          <TableNameCell
                            name={row.name}
                            isRowInFilters={!!isRowInFilters(row)}
                            image={flagUrl}
                            imageType="location"
                            pageUrl={buildMapUrl(row.latitude, row.longitude)}
                          />
                          <TableCell
                            className={`w-[12%] px-4 ${
                              view === ViewType.TABLE ? "py-1" : "py-3"
                            } text-sm ${
                              isRowInFilters(row)
                                ? "font-bold text-[#8C2D19]"
                                : "text-[#000000]"
                            } align-middle hover:text-[#8C2D19] transition-colors relative`}
                          >
                            <div className="flex items-center gap-0 justify-center">
                              {view === ViewType.TABLE ? (
                                <>
                                  <CountComponent count={row.count} />
                                  <div
                                    className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                                      view === ViewType.TABLE ? "ml-1" : "ml-0"
                                    }`}
                                    title={`Filter on ${row.name}`}
                                  >
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Popover
                                            open={openPopoverId === row.id}
                                            onOpenChange={(open) =>
                                              setOpenPopoverId(
                                                open ? row.id : null
                                              )
                                            }
                                          >
                                            <PopoverTrigger asChild>
                                              <Button
                                                aria-label="Add/Remove from filters"
                                                disabled={
                                                  mode === GEO_DRILL_TYPE.CITY
                                                }
                                                variant="ghost"
                                                size="sm"
                                                className={`p-1 h-6 w-6 rounded-full ${
                                                  isRowInFilters(row)
                                                    ? "bg-[#8C2D19] bg-opacity-20 hover:bg-[#8C2D19] hover:bg-opacity-30"
                                                    : "bg-gray-100 hover:bg-gray-200"
                                                }`}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setOpenPopoverId(row.id);
                                                }}
                                              >
                                                <Filter className="h-4 w-4 text-[#8C2D19]" />
                                              </Button>
                                            </PopoverTrigger>
                                            <PopoverContent
                                              className="w-56 p-0 rounded-lg shadow-xl border bg-white"
                                              align="end"
                                              sideOffset={8}
                                            >
                                              <div className="px-4 py-2 border-b bg-gray-50 rounded-t-lg">
                                                <span className="font-semibold text-gray-700 text-sm">
                                                  {isRowInFilters(row)
                                                    ? "Update Filter"
                                                    : "Add Filter"}
                                                </span>
                                              </div>
                                              <button
                                                className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-[#F7E7E3] active:bg-[#F2D3C7] transition-colors text-[#8C2D19] text-sm font-medium"
                                                onClick={() => {
                                                  onAddToFilters?.(
                                                    row.id,
                                                    "role"
                                                  );
                                                  setOpenPopoverId(null);
                                                }}
                                              >
                                                <svg
                                                  className="w-4 h-4 text-[#8C2D19]"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  strokeWidth="2"
                                                  viewBox="0 0 24 24"
                                                >
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M12 11c0 1.104-.896 2-2 2s-2-.896-2-2 .896-2 2-2 2 .896 2 2zm0 0c0 1.104.896 2 2 2s2-.896 2-2-.896-2-2-2-2 .896-2 2zm-6 8v-2a4 4 0 014-4h4a4 4 0 014 4v2"
                                                  />
                                                </svg>
                                                {isRowInFilters(row, "role")
                                                  ? "Remove as Role Filter"
                                                  : "Add as Role Filter"}
                                              </button>
                                              <div className="border-t mx-2" />
                                              <button
                                                className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-[#F7E7E3] active:bg-[#F2D3C7] transition-colors text-[#8C2D19] text-sm font-medium rounded-b-lg"
                                                onClick={() => {
                                                  onAddToFilters?.(
                                                    row.id,
                                                    "company"
                                                  );
                                                  setOpenPopoverId(null);
                                                }}
                                              >
                                                <svg
                                                  className="w-4 h-4 text-[#8C2D19]"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  strokeWidth="2"
                                                  viewBox="0 0 24 24"
                                                >
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M3 21V7a2 2 0 012-2h2a2 2 0 012 2v14M7 21V7m0 0V5a2 2 0 012-2h2a2 2 0 012 2v2m0 0v14m0-14h2a2 2 0 012 2v14"
                                                  />
                                                </svg>
                                                {isRowInFilters(row, "company")
                                                  ? "Remove as Company Filter"
                                                  : "Add as Company Filter"}
                                              </button>
                                            </PopoverContent>
                                          </Popover>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Filter on {row.name}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                </>
                              ) : (
                                <TrendLineComponent
                                  dataPoints={row.trend}
                                  trendFrequency={trendFrequency}
                                />
                              )}
                              <div
                                className={`${
                                  isRowInFilters(row)
                                    ? "opacity-100"
                                    : "opacity-0 group-hover:opacity-100"
                                } transition-opacity ${
                                  view === ViewType.TABLE ? "ml-2" : "ml-0"
                                }`}
                              >
                                {/*  Note that we have a bug when filtering citiesdirectly on the dashboard */}
                              </div>
                            </div>
                          </TableCell>
                        </CustomTableRow>
                      );
                    })
                  ) : (
                    <NotFoundComponent
                      message={`No ${mode} data available`}
                      description={`Try adjusting your filters to find ${mode}s that match your criteria.`}
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
          totalItems={
            mode === GEO_DRILL_TYPE.COUNTRY ? totalCountries : totalCities
          }
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
        {mode === GEO_DRILL_TYPE.COUNTRY ? (
          isGeoLoading || isGeoFetching ? (
            <LoadingChart message="Loading chart data..." />
          ) : countries.length === 0 ? (
            <NotFoundComponent
              message="No country data available"
              description="Try adjusting your filters to find countries that match your criteria."
              colSpan={1}
            />
          ) : (
            <ChartView
              data={countries}
              isLoading={isGeoLoading || isGeoFetching}
              entityType={EntityType.COUNTRY}
            />
          )
        ) : isGeoLoading || isGeoFetching ? (
          <LoadingChart message="Loading chart data..." />
        ) : cities.length === 0 ? (
          <NotFoundComponent
            message="No city data available"
            description="Try adjusting your filters to find cities that match your criteria."
            colSpan={1}
          />
        ) : (
          <ChartView
            data={cities}
            isLoading={isGeoLoading || isGeoFetching}
            entityType={EntityType.CITY}
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
            title={capitalize(mode)}
            icon={
              mode === GEO_DRILL_TYPE.COUNTRY ? (
                <Flag className="h-5 w-5 text-[#8C2D19]" />
              ) : (
                <MapPin className="h-5 w-5 text-[#8C2D19]" />
              )
            }
            className="pl-1"
            tooltipMessage={
              mode === GEO_DRILL_TYPE.COUNTRY
                ? "Distribution of alumni by the country of their role."
                : "Distribution of alumni by the city of their role."
            }
          />
        </div>

        {/* <div className="flex gap-1 bg-gray-50 px-2 py-1 rounded-full">
          {[
            {
              mode: GEO_DRILL_TYPE.COUNTRY,
              label: "Countries",
              icon: <Flag className="h-4 w-4 sm:h-5 sm:w-5" />,
              tooltip: "View distribution by countries",
            },
            {
              mode: GEO_DRILL_TYPE.CITY,
              label: "Cities",
              icon: <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />,
              tooltip: "View distribution by cities",
            },
          ].map(({ mode: m, label, icon, tooltip }) => {
            const isActive = m === mode;
            return (
              <TooltipProvider key={label}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMode(m)}
                      className={`flex items-center gap-1 rounded-full px-2 sm:px-3 py-1.5 text-sm transition-all ${
                        isActive
                          ? "bg-[#8C2D19]/10 text-[#8C2D19] font-semibold"
                          : "text-muted-foreground"
                      }`}
                      aria-label={`Toggle ${label}`}
                    >
                      {icon}
                      <span className="hidden sm:inline">{label}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div> */}

        <div className="flex items-center space-x-2">
          <ToggleGroup
            type="single"
            value={mode}
            onValueChange={(value: string) =>
              value && setMode(value as GEO_DRILL_TYPE)
            }
            className="flex gap-1 group bg-gray-50 p-0.5 rounded-lg"
          >
            <ToggleGroupItem
              value={GEO_DRILL_TYPE.COUNTRY}
              aria-label="Country View"
              className="px-2 py-1 text-sm data-[state=on]:bg-gradient-to-r data-[state=on]:from-[#8C2D19] data-[state=on]:to-[#A13A28] data-[state=on]:text-white data-[state=on]:shadow-[0_0_8px_rgba(140,45,25,0.5)] hover:scale-105 transition-all duration-200 ease-in-out data-[state=off]:bg-white data-[state=off]:border data-[state=off]:border-gray-200 hover:data-[state=off]:bg-gray-100"
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <Flag className="h-4 w-4 mr-1 inline-block transition-transform duration-200" />
                      <span className="hidden sm:inline">Countries</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {mode === GEO_DRILL_TYPE.COUNTRY
                        ? "Distribution by Country"
                        : "Change to Country view"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </ToggleGroupItem>

            <ToggleGroupItem
              value={GEO_DRILL_TYPE.CITY}
              aria-label="City View"
              className="px-2 py-1 text-sm data-[state=on]:bg-gradient-to-r data-[state=on]:from-[#8C2D19] data-[state=on]:to-[#A13A28] data-[state=on]:text-white data-[state=on]:shadow-[0_0_8px_rgba(140,45,25,0.5)] hover:scale-105 transition-all duration-200 ease-in-out data-[state=off]:bg-white data-[state=off]:border data-[state=off]:border-gray-200 hover:data-[state=off]:bg-gray-100"
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 inline-block transition-transform duration-200 group-hover:bounce" />
                      <span className="hidden sm:inline">Cities</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {mode === GEO_DRILL_TYPE.CITY
                        ? "Distribution by City"
                        : "Change to City view"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="border rounded-md overflow-hidden">
          <div className="border rounded-md overflow-hidden">
            <ViewToggle view={view} setView={setView} />
          </div>
        </div>
      </div>

      {/* Maybe fix this weird logic */}
      {view === ViewType.TABLE && renderTable()}
      {view === ViewType.TREND && renderTable()}
      {view === ViewType.CHART && renderChartView()}
    </div>
  );
};
