"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { CountryListItemDto, CountryListResponseDto } from "@/sdk";
import { Flag } from "lucide-react";
import { IndustryDataSkeleton } from "./skeletons/IndustryDataSkeleton";
import PaginationControls from "./common/PaginationControls";
import TableTitle from "./common/TableTitle";
import { useCountryList } from "@/hooks/analytics/useCountryList";
import CustomTableHeader from "./common/CustomeTableHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
} from "@/components/ui/table";
import ImageWithFallback from "../ui/image-with-fallback";
import { SortBy, SortOrder, ITEMS_PER_PAGE, DASHBOARD_HEIGHT } from "@/consts";
import { FilterState } from "./common/GlobalFilters";
import { NotFoundComponent } from "./common/NotFoundComponent";

type CountryDashboardProps = {
  onDataUpdate: (countryCount: number) => void;
  filters: FilterState;
};

export default function CountryDashboard({
  onDataUpdate,
  filters,
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

  const { data, isLoading, isFetching } = useCountryList({
    ...filters,
    limit: itemsPerPage,
    sortBy: sortField,
    sortOrder: sortOrder,
    offset: (page - 1) * itemsPerPage,
  });

  const countries = data?.countries || [];
  const totalItems = data?.total || 0;

  // Update parent only when total changes
  useEffect(() => {
    if (data?.total !== undefined) {
      onDataUpdate(data.total);
    }
  }, [data?.total, onDataUpdate]);

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

  return (
    <div
      className={`w-full ${DASHBOARD_HEIGHT} flex flex-col border rounded-xl shadow-lg p-3 box-border bg-white`}
    >
      <TableTitle
        title="Countries"
        icon={<Flag className="h-5 w-5 text-[#8C2D19]" />}
      />

      <div className="flex-1 overflow-y-auto mb-2 relative border-t border-b border-gray-200 custom-scrollbar">
        <TableContainer className="w-full h-full">
          <Table className="min-w-full bg-white table-fixed">
            <CustomTableHeader
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSort}
              companiesHoverMessage="Number of companies headquartered in this country"
              alumniHoverMessage="Number of alumni who have had at least one role in this country"
            />

            {isLoading || isFetching ? (
              <IndustryDataSkeleton />
            ) : (
              <TableBody className="bg-white divide-y divide-gray-200">
                {countries.length > 0 ? (
                  countries.map(
                    (country: CountryListItemDto, index: number) => {
                      const rowNumber = (page - 1) * itemsPerPage + index + 1;
                      const flagUrl = country.code
                        ? `https://flagcdn.com/${country.code.toLowerCase()}.svg`
                        : "";
                      return (
                        <TableRow
                          key={country.id}
                          className={`${
                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                          } hover:bg-[#A13A23] hover:bg-opacity-10 transition-colors duration-200`}
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
                              className="text-sm font-medium text-[#000000] h-auto p-0 hover:text-[#8C2D19] transition-colors"
                              onClick={() => {
                                window.open(`/country/${country.id}`, "_blank");
                              }}
                            >
                              <div
                                title={country.name}
                                className="text-ellipsis overflow-hidden w-full text-left"
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
                        </TableRow>
                      );
                    }
                  )
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

      <PaginationControls
        page={page}
        setPage={setPage}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        totalItems={totalItems}
      />
    </div>
  );
}
