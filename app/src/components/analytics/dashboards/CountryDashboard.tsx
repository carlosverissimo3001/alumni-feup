"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { CountryListItemDto, CityListItemDto } from "@/sdk";
import { Filter, Flag, MapPin } from "lucide-react";
import { IndustryDataSkeleton } from "../skeletons/IndustryDataSkeleton";
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

type CountryDashboardProps = {
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

export default function CountryDashboard({
  onDataUpdate,
  filters,
  onAddToFilters,
  mode,
  setMode,
}: CountryDashboardProps) {
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE[1]);
  const [sortField, setSortField] = useState<SortBy>(SortBy.ALUMNI_COUNT);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.DESC);

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
    onDataUpdate(totalCountries, countryFilteredCount, totalCities, cityFilteredCount);
  }, [totalCountries, countryFilteredCount, totalCities, cityFilteredCount, onDataUpdate]);

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

  const countryTable = (
    <div className="flex-1 relative border-t border-b border-gray-200 flex flex-col overflow-hidden">
      <TableContainer className="flex-1 overflow-auto custom-scrollbar">
        <Table className="min-w-full bg-white table-fixed [&>div]:overflow-visible">
          <CustomTableHeader
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
            companiesHoverMessage="Number of companies headquartered in this country"
            alumniHoverMessage="Number of alumni who have had at least one role in this country"
          />

          {isCountryLoading || isCountryFetching ? (
            <IndustryDataSkeleton />
          ) : (
            <TableBody className="bg-white divide-y divide-gray-200">
              {countries.length > 0 ? (
                countries.map((country: CountryListItemDto, index: number) => {
                  const rowNumber = (page - 1) * itemsPerPage + index + 1;
                  const flagUrl = country.code
                    ? `https://flagcdn.com/${country.code.toLowerCase()}.svg`
                    : "";
                  return (
                    <TableRow
                      key={country.id}
                      className={`group ${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-[#A13A23] hover:bg-opacity-10 transition-colors duration-200 relative`}
                    >
                      <TableCell className="w-1/12 py-1 pl-3 text-sm text-gray-500 font-medium align-middle">
                        {rowNumber}
                      </TableCell>
                      <TableCell className="w-7/12 py-1.5 pl-3 text-sm font-medium text-[#000000] align-middle flex items-center gap-1">
                        <div className="min-w-[24px] w-6 h-6 mr-1.5 rounded-full overflow-hidden flex items-center justify-center bg-gray-50">
                          <ImageWithFallback
                            src={flagUrl}
                            alt={`${country.name} flag`}
                            width={20}
                            height={20}
                            className="rounded-full object-contain w-full h-full"
                          />
                        </div>
                        <Button
                          variant="link"
                          className="text-sm font-medium text-[#000000] h-auto p-0 hover:text-[#8C2D19] transition-colors mr-2"
                          onClick={() => {
                            window.open(`/country/${country.id}`, "_blank");
                          }}
                        >
                          <div
                            title={country.name}
                            className="text-ellipsis overflow-hidden text-left"
                          >
                            {country.name}
                          </div>
                        </Button>
                      </TableCell>
                      <TableCell className="w-2/12 pl-3 py-1.5 text-sm text-[#000000] align-middle hover:text-[#8C2D19] transition-colors">
                        <span className="font-semibold block text-left">
                          {country.companyCount}
                        </span>
                      </TableCell>
                      <TableCell className="w-2/12 pl-3 py-1.5 text-sm text-[#000000] align-middle hover:text-[#8C2D19] transition-colors">
                        <span className="font-semibold block text-left">
                          {country.alumniCount}
                        </span>
                      </TableCell>
                      <TableCell className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                aria-label="Add to filters"
                                variant="ghost"
                                size="sm"
                                className="p-1 h-6 w-6 rounded-full bg-gray-100 hover:bg-gray-200"
                                onClick={() => onAddToFilters?.(country.id)}
                              >
                                <Filter className="h-4 w-4 text-[#8C2D19]" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Filter on {country.name}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <NotFoundComponent
                  message="No country data available"
                  description="Try adjusting your filters to find countries that match your criteria."
                  colSpan={4}
                />
              )}
            </TableBody>
          )}
        </Table>
      </TableContainer>
    </div>
  );

  const cityTable = (
    <div className="flex-1 relative border-t border-b border-gray-200 flex flex-col overflow-hidden">
      <TableContainer className="flex-1 overflow-auto custom-scrollbar">
        <Table className="min-w-full bg-white table-fixed [&>div]:overflow-visible">
          <CustomTableHeader
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
            companiesHoverMessage="Number of companies headquartered in this city"
            alumniHoverMessage="Number of alumni who have had at least one role in this city"
          />

          {isCityLoading || isCityFetching ? (
            <IndustryDataSkeleton />
          ) : (
            <TableBody className="bg-white divide-y divide-gray-200">
              {cities.length > 0 ? (
                cities.map((city: CityListItemDto, index: number) => {
                  const rowNumber = (page - 1) * itemsPerPage + index + 1;
                  const flagUrl = city.code
                    ? `https://flagcdn.com/${city.code.toLowerCase()}.svg`
                    : "";
                  return (
                    <TableRow
                      key={city.id}
                      className={`group ${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-[#A13A23] hover:bg-opacity-10 transition-colors duration-200 relative`}
                    >
                      <TableCell className="w-1/12 py-1 pl-3 text-sm text-gray-500 font-medium align-middle">
                        {rowNumber}
                      </TableCell>
                      <TableCell className="w-7/12 py-1.5 pl-3 text-sm font-medium text-[#000000] align-middle flex items-center gap-1">
                        <div className="min-w-[24px] w-6 h-6 mr-1.5 rounded-full overflow-hidden flex items-center justify-center bg-gray-50">
                          <ImageWithFallback
                            src={flagUrl}
                            fallbackSrc="/images/no-location.png"
                            alt={`${city.name} flag`}
                            width={20}
                            height={20}
                            className="rounded-full object-contain w-full h-full"
                          />
                        </div>
                        <Button
                          variant="link"
                          className="text-sm font-medium text-[#000000] h-auto p-0 hover:text-[#8C2D19] transition-colors mr-2"
                          onClick={() => {
                            window.open(`/city/${city.id}`, "_blank");
                          }}
                        >
                          <div
                            title={city.name}
                            className="text-ellipsis overflow-hidden text-left"
                          >
                            {city.name}
                          </div>
                        </Button>
                      </TableCell>
                      <TableCell className="w-2/12 pl-3 py-1.5 text-sm text-[#000000] align-middle hover:text-[#8C2D19] transition-colors">
                        <span className="font-semibold block text-left">
                          {city.companyCount}
                        </span>
                      </TableCell>
                      <TableCell className="w-2/12 pl-3 py-1.5 text-sm text-[#000000] align-middle hover:text-[#8C2D19] transition-colors">
                        <span className="font-semibold block text-left">
                          {city.alumniCount}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <NotFoundComponent
                  message="No city data available"
                  description="Try adjusting your filters to find cities that match your criteria."
                  colSpan={4}
                />
              )}
            </TableBody>
          )}
        </Table>
      </TableContainer>
    </div>
  );

  return (
    <div
      className={`w-full ${DASHBOARD_HEIGHT} flex flex-col border rounded-xl shadow-lg p-3 box-border bg-white`}
    >
      <div className="flex items-center justify-between mb-1">
        <TableTitle
          title={mode === "country" ? "Countries" : "Cities"}
          icon={
            mode === "country" ? (
              <Flag className="h-5 w-5 text-[#8C2D19]" />
            ) : (
              <MapPin className="h-5 w-5 text-[#8C2D19]" />
            )
          }
        />
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

      {mode === "country" ? countryTable : cityTable}

      <PaginationControls
        page={page}
        setPage={setPage}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        totalItems={mode === "country" ? totalCountries : totalCities}
      />
    </div>
  );
}
