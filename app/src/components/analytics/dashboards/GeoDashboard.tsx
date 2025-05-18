"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Filter, Flag, MapPin } from "lucide-react";
import { DashboardSkeleton } from "../skeletons/DashboardSkeleton";
import PaginationControls from "../common/PaginationControls";
import TableTitle from "../common/TableTitle";
import { useCountryList } from "@/hooks/analytics/useCountryList";
import { useCityList } from "@/hooks/analytics/useCityList";
import CustomTableHeader from "../common/CustomTableHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
} from "@/components/ui/table";
import ImageWithFallback from "../../ui/image-with-fallback";
import { SortBy, SortOrder, ITEMS_PER_PAGE, DASHBOARD_HEIGHT } from "@/consts";
import { FilterState } from "../common/GlobalFilters";
import { NotFoundComponent } from "../common/NotFoundComponent";
import { Switch } from "@/components/ui/switch";
import ChartView from "../common/ChartView";
import { ViewType } from "@/types/view";
import CountComponent from "../common/CountComponent";
import TrendLineComponent from "../common/TrendLineComponent";
import LoadingChart from "../common/LoadingChart";
import { TrendFrequency, EntityType } from "@/types/entityTypes";
import { DataPointDto } from "@/sdk";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import CustomTableRow from "../common/CustomTableRow";
import { GeoDrillType } from "@/types/drillType";
import { TrendTooltip } from "../common/TrendTooltip";
import ViewToggle from "../common/ViewToggle";
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type GeoDashboardProps = {
  onDataUpdate: (
    countryCount: number,
    countryFilteredCount: number,
    cityCount: number,
    cityFilteredCount: number
  ) => void;
  filters: FilterState;
  onAddToFilters?: (id: string, type: "role" | "company") => void;
  mode: GeoDrillType;
  setMode: (mode: GeoDrillType) => void;
};

type DataRowProps = {
  id: string;
  code: string;
  name: string;
  count: number;
  trend: DataPointDto[];
};

export default function GeoDashboard({
  onDataUpdate,
  filters,
  onAddToFilters,
  mode,
  setMode,
}: GeoDashboardProps) {
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

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  const {
    data: countryData,
    isLoading: isCountryLoading,
    isFetching: isCountryFetching,
  } = useCountryList({
    ...filters,
    limit: itemsPerPage,
    sortBy: sortField,
    sortOrder: sortOrder,
    offset: (page - 1) * itemsPerPage,
    includeTrend: view === ViewType.TREND,
  });

  const {
    data: cityData,
    isLoading: isCityLoading,
    isFetching: isCityFetching,
  } = useCityList({
    ...filters,
    limit: itemsPerPage,
    sortBy: sortField,
    sortOrder: sortOrder,
    offset: (page - 1) * itemsPerPage,
    includeTrend: view === ViewType.TREND,
  });

  const countries = countryData?.countries || [];
  const totalCountries = countryData?.count || 0;
  const countryFilteredCount = countryData?.filteredCount || 0;

  const cities = cityData?.cities || [];
  const totalCities = cityData?.count || 0;
  const cityFilteredCount = cityData?.filteredCount || 0;

  // Update parent only when total changes
  useEffect(() => {
    onDataUpdate(
      totalCountries,
      countryFilteredCount,
      totalCities,
      cityFilteredCount
    );
  }, [
    totalCountries,
    countryFilteredCount,
    totalCities,
    cityFilteredCount,
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
    // Not sure if we should reset the page when sorting changes
    // setPage(1);
  };

  const renderTable = () => {
    const data = mode === GeoDrillType.COUNTRY ? countries : cities;
    const isLoading =
      mode === GeoDrillType.COUNTRY
        ? isCountryLoading || isCountryFetching
        : isCityLoading || isCityFetching;

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

              {isLoading ? (
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
                          <TableCell className="w-1/12 py-1.5 pl-3 text-sm text-gray-500 font-medium align-middle">
                            {rowNumber}
                          </TableCell>
                          <TableCell
                            className={`w-7/12 py-1.5 pl-3 text-sm ${
                              isRowInFilters(row)
                                ? "font-bold text-[#8C2D19]"
                                : "font-medium text-[#000000]"
                            } flex items-center gap-1 align-middle`}
                          >
                            <div className="min-w-[24px] w-6 h-6 mr-1.5 rounded-full overflow-hidden flex items-center justify-center bg-gray-50">
                              <ImageWithFallback
                                src={flagUrl}
                                fallbackSrc="/images/no-location.png"
                                alt={`${row.name} flag`}
                                width={24}
                                height={24}
                                className="rounded-full object-contain w-full h-full"
                              />
                            </div>
                            <div
                              title={row.name}
                              className="text-ellipsis overflow-hidden text-left p-1"
                            >
                              {row.name}
                            </div>
                          </TableCell>
                          <TableCell
                            className={`w-2/12 px-3 py-1 text-sm ${
                              isRowInFilters(row)
                                ? "font-bold text-[#8C2D19]"
                                : "text-[#000000]"
                            } align-middle hover:text-[#8C2D19] transition-colors relative`}
                          >
                            <div className="flex items-center gap-0 justify-center">
                              {view === ViewType.TABLE ? (
                                <CountComponent count={row.count} />
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
                                <div
                                  className={`flex items-center gap-2 ${
                                    mode === GeoDrillType.CITY && "invisible"
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
                                                mode === GeoDrillType.CITY
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
            mode === "country" ? countryFilteredCount : cityFilteredCount
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
        {mode === GeoDrillType.COUNTRY ? (
          isCountryLoading || isCountryFetching ? (
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
              isLoading={isCountryLoading || isCountryFetching}
              entityType={EntityType.COUNTRY}
            />
          )
        ) : isCityLoading || isCityFetching ? (
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
            isLoading={isCityLoading || isCityFetching}
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
            title={mode === "country" ? "Countries" : "Cities"}
            icon={
              mode === "country" ? (
                <Flag className="h-5 w-5 text-[#8C2D19]" />
              ) : (
                <MapPin className="h-5 w-5 text-[#8C2D19]" />
              )
            }
            className="pl-1"
            tooltipMessage={
              mode === "country"
                ? "Distribution of alumni by the country of their role."
                : "Distribution of alumni by the city of their role."
            }
          />

          {view === ViewType.TREND && (
            <TrendTooltip
              entityType={
                mode === "country" ? EntityType.COUNTRY : EntityType.CITY
              }
              trendFrequency={trendFrequency}
            />
          )}
        </div>

        <div className="border rounded-md overflow-hidden">
          <div className="border rounded-md overflow-hidden">
            <ViewToggle view={view} setView={setView} />
          </div>
        </div>

        <div
          className="flex items-center space-x-2 bg-gray-50 px-2 py-1 rounded-full"
          title="Toggle view mode"
        >
          <span
            className={`text-sm font-medium cursor-pointer ${
              mode === GeoDrillType.COUNTRY
                ? "text-[#8C2D19] font-semibold"
                : "text-gray-500"
            }`}
            onClick={() => setMode(GeoDrillType.COUNTRY)}
          >
            Countries
          </span>
          <Switch
            id="mode-toggle"
            checked={mode === GeoDrillType.CITY}
            onCheckedChange={(checked) =>
              setMode(checked ? GeoDrillType.CITY : GeoDrillType.COUNTRY)
            }
          />
          <span
            className={`text-sm font-medium cursor-pointer ${
              mode === GeoDrillType.CITY
                ? "text-[#8C2D19] font-semibold"
                : "text-gray-500"
            }`}
            onClick={() => setMode(GeoDrillType.CITY)}
          >
            Cities
          </span>
        </div>
      </div>

      {/* Maybe fix this weird logic */}
      {view === ViewType.TABLE && renderTable()}
      {view === ViewType.TREND && renderTable()}
      {view === ViewType.CHART && renderChartView()}
    </div>
  );
}
