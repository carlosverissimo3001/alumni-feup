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
import { IndustryListItemDto, IndustryListResponseDto } from "@/sdk";
import { Factory } from "lucide-react";
import { IndustryDataSkeleton } from "./skeletons/IndustryDataSkeleton";
import { useIndustryList } from "@/hooks/analytics/useIndustryList";
import PaginationControls from "./common/PaginationControls";
import TableTitle from "./common/TableTitle";
import CustomTableHeader from "./common/CustomeTableHeader";
import { SortBy, SortOrder, ITEMS_PER_PAGE, DASHBOARD_HEIGHT } from "@/consts";
import { FilterState } from "./common/GlobalFilters";

type IndustryDashboardProps = {
  onDataUpdate: (industryCount: number) => void;
  filters: FilterState;
};

export default function IndustryDashboard({
  onDataUpdate,
  filters,
}: IndustryDashboardProps) {
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE[2]);
  const [sortField, setSortField] = useState<SortBy>(SortBy.ALUMNI_COUNT);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.DESC);
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pageInput, setPageInput] = useState<string>(String(page));

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  const { data, isLoading, isFetching } = useIndustryList({
    ...filters,
    limit: itemsPerPage,
    sortBy: sortField,
    sortOrder: sortOrder,
    offset: (page - 1) * itemsPerPage,
  });

  const industries = data?.industries || [];
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
        title="Industries"
        icon={<Factory className="h-5 w-5 text-[#8C2D19]" />}
      />

      <div className="flex-1 overflow-y-auto mb-2 relative border-t border-b border-gray-200 custom-scrollbar">
        <TableContainer className="w-full h-full">
          <Table className="min-w-full bg-white table-fixed">
            <CustomTableHeader
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSort}
            />

            {isLoading || isFetching ? (
              <IndustryDataSkeleton />
            ) : (
              <TableBody className="bg-white divide-y divide-gray-200">
                {industries.length > 0 ? (
                  industries.map(
                    (industry: IndustryListItemDto, index: number) => {
                      const rowNumber = (page - 1) * itemsPerPage + index + 1;
                      return (
                        <TableRow
                          key={industry.id}
                          className={`${
                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                          } hover:bg-[#A13A23] hover:bg-opacity-10 transition-colors duration-200`}
                        >
                          <TableCell className="w-1/12 py-1 pl-3 text-sm text-gray-500 font-medium align-middle">
                            {rowNumber}
                          </TableCell>
                          <TableCell className="w-5/12 py-1 pl-3 text-sm font-medium text-[#000000] align-middle">
                            <Button
                              variant="link"
                              className="text-sm font-medium text-[#000000] w-full text-left h-auto p-0 hover:text-[#8C2D19] transition-colors"
                              onClick={() => {
                                window.open(
                                  `/industry/${industry.id}`,
                                  "_blank"
                                );
                              }}
                            >
                              <div
                                title={industry.name}
                                className="text-ellipsis overflow-hidden w-full text-left"
                              >
                                {industry.name}
                              </div>
                            </Button>
                          </TableCell>
                          <TableCell className="w-3/12 pl-3 py-1 text-sm text-[#000000] align-middle hover:text-[#8C2D19] transition-colors">
                            <span className="font-semibold">
                              {industry.companyCount}
                            </span>
                          </TableCell>
                          <TableCell className="w-3/12 pl-3 py-1 text-sm text-[#000000] align-middle hover:text-[#8C2D19] transition-colors">
                            <span className="font-semibold">
                              {industry.alumniCount}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    }
                  )
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-[#000000] py-4"
                    >
                      No industry data available.
                    </TableCell>
                  </TableRow>
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
