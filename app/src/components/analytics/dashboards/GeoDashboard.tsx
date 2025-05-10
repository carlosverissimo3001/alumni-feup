"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Filter,
  Flag,
  Info,
  MapPin,
  TrendingUp,
  TrendingDown,
  TableIcon,
  PieChart,
  LineChart,
} from "lucide-react";
import { DashboardSkeleton } from "../skeletons/DashboardSkeleton";
import PaginationControls from "../common/PaginationControls";
import TableTitle from "../common/TableTitle";
import { useCountryList } from "@/hooks/analytics/useCountryList";
import { useCityList } from "@/hooks/analytics/useCityList";
import CustomTableHeader from "../common/CustomeTableHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
} from "@/components/ui/table";
import ImageWithFallback from "../../ui/image-with-fallback";
import { SortBy, SortOrder, ITEMS_PER_PAGE, DASHBOARD_HEIGHT } from "@/consts";
import { FilterState } from "../common/GlobalFilters";
import { NotFoundComponent } from "../common/NotFoundComponent";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import ChartView from "../common/ChartView";
import { ViewType } from "@/types/view";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import CountComponent from "../common/CountComponent";
import TrendLineComponent from "../common/TrendLineComponent";
import LoadingChart from "../common/LoadingChart";
type GeoDashboardProps = {
  onDataUpdate: (
    countryCount: number,
    countryFilteredCount: number,
    cityCount: number,
    cityFilteredCount: number
  ) => void;
  filters: FilterState;
  onAddToFilters?: (countryId: string) => void;
  mode: "country" | "city";
  setMode: (mode: "country" | "city") => void;
};

type DataRowProps = {
  id: string;
  code: string;
  name: string;
  companyCount: number;
  alumniCount: number;
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
  const [sortField, setSortField] = useState<SortBy>(SortBy.ALUMNI_COUNT);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.DESC);
  const [view, setView] = useState<ViewType>(ViewType.TABLE);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pageInput, setPageInput] = useState<string>(String(page));

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
    const data = mode === "country" ? countries : cities;
    const isLoading =
      mode === "country"
        ? isCountryLoading || isCountryFetching
        : isCityLoading || isCityFetching;

    return (
      <>
        <div className="flex-1 relative border-t border-b border-gray-200 flex flex-col overflow-hidden">
          <TableContainer className="flex-1 overflow-auto custom-scrollbar">
            <Table className="min-w-full bg-white table-fixed [&>div]:overflow-visible">
              <CustomTableHeader
                sortField={sortField}
                sortOrder={sortOrder}
                onSort={handleSort}
                companiesHoverMessage={`Number of companies headquartered in this ${mode}`}
                alumniHoverMessage={`Number of alumni who have had at least one role in this ${mode}`}
              />

              {isLoading ? (
                <DashboardSkeleton hasExtraColumn={true} />
              ) : (
                <TableBody className="bg-white divide-y divide-gray-200">
                  {data.length > 0 ? (
                    data.map((row: DataRowProps, index: number) => {
                      const rowNumber = (page - 1) * itemsPerPage + index + 1;
                      const flagUrl = row.code
                        ? `https://flagcdn.com/${row.code.toLowerCase()}.svg`
                        : "";
                      return (
                        <TableRow
                          key={row.id}
                          className={`group ${
                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                          } hover:bg-[#A13A23] hover:bg-opacity-10 transition-colors duration-200 relative`}
                        >
                          <TableCell className="w-1/12 py-1.5 pl-3 text-sm text-gray-500 font-medium align-middle">
                            {rowNumber}
                          </TableCell>
                          <TableCell className="w-7/12 py-1.5 pl-3 text-sm font-medium text-[#000000] flex items-center gap-1 align-middle">
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
                            <Button
                              variant="link"
                              className="text-sm font-medium text-[#000000] h-auto p-1 hover:text-[#8C2D19] transition-colors mr-2"
                              onClick={() => {
                                window.open(`/${mode}/${row.id}`, "_blank");
                              }}
                            >
                              <div
                                title={row.name}
                                className="text-ellipsis overflow-hidden text-left"
                              >
                                {row.name}
                              </div>
                            </Button>
                          </TableCell>
                          <TableCell className="w-2/12 pl-3 py-1 text-sm text-[#000000] align-middle hover:text-[#8C2D19] transition-colors">
                            <div className="flex items-center gap-0 justify-center">
                              {view === ViewType.TABLE ? (
                                <CountComponent count={row.companyCount} />
                              ) : (
                                <TrendLineComponent
                                  dataPoints={[25, 27, 29, 30, 31]}
                                />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="w-2/12 px-3 py-1 text-sm text-[#000000] align-middle hover:text-[#8C2D19] transition-colors relative">
                            <div className="flex items-center gap-0 justify-center">
                              {view === ViewType.TABLE ? (
                                <CountComponent count={row.alumniCount} />
                              ) : (
                                <TrendLineComponent
                                  dataPoints={[25, 27, 29, 30, 31]}
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
                                        onClick={() => onAddToFilters?.(row.id)}
                                      >
                                        <Filter className="h-4 w-4 text-[#8C2D19]" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Filter on {row.name}</p>
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
                      message={`No ${mode} data available`}
                      description={`Try adjusting your filters to find ${mode}s that match your criteria.`}
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
          totalItems={mode === "country" ? totalCountries : totalCities}
          visible={data.length > 0}
        />
      </>
    );
  };

  const renderChartView = () => (
    <div className="flex-1 flex flex-col border-t border-b border-gray-200 overflow-hidden">
      <div className="flex-1 flex items-center justify-center">
        {mode === "country" ? (
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
              dataKey={
                sortField === SortBy.ALUMNI_COUNT
                  ? "alumniCount"
                  : "companyCount"
              }
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
            dataKey={
              sortField === SortBy.ALUMNI_COUNT ? "alumniCount" : "companyCount"
            }
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
          />

          {view === ViewType.TREND && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-5 w-5 text-[#8C2D19] ml-2" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs" align="start">
                  <div className="space-y-2">
                    <p>
                      <strong>Trend View:</strong> Shows the change in {mode}{" "}
                      presence over the past 5 years
                    </p>
                    <p>
                      <TrendingUp className="h-3.5 w-3.5 inline text-green-500 mr-1" />{" "}
                      Indicates growing{" "}
                      {mode === "country" ? "countries" : "cities"}
                    </p>
                    <p>
                      <TrendingDown className="h-3.5 w-3.5 inline text-red-500 mr-1" />{" "}
                      Indicates declining{" "}
                      {mode === "country" ? "countries" : "cities"}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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

        <div
          className="flex items-center space-x-2 bg-gray-50 px-2 py-1 rounded-full"
          title="Toggle view mode"
        >
          <span
            className={`text-sm font-medium cursor-pointer ${
              mode === "country"
                ? "text-[#8C2D19] font-semibold"
                : "text-gray-500"
            }`}
            onClick={() => setMode("country")}
          >
            Countries
          </span>
          <Switch
            id="mode-toggle"
            checked={mode === "city"}
            onCheckedChange={(checked) => setMode(checked ? "city" : "country")}
          />
          <span
            className={`text-sm font-medium cursor-pointer ${
              mode === "city" ? "text-[#8C2D19] font-semibold" : "text-gray-500"
            }`}
            onClick={() => setMode("city")}
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
