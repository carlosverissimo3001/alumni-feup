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
import { useCompanyList } from "@/hooks/analytics/useCompanyList";
import { CompanyListItemDto } from "@/sdk";
import { Building2, Filter } from "lucide-react";
import ImageWithFallback from "../../ui/image-with-fallback";
import PaginationControls from "../common/PaginationControls";
import { CompanyDataSkeleton } from "../skeletons/CompanyDataSkeleton";
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

type CompanyDashboardProps = {
  onDataUpdate: (
    alumniCount: number,
    companyCount: number,
    alumniFilteredCount: number,
    companyFilteredCount: number
  ) => void;
  filters: FilterState;
  onAddToFilters?: (companyId: string) => void;
};

export default function CompanyDashboard({
  onDataUpdate,
  filters,
  onAddToFilters,
}: CompanyDashboardProps) {
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE[1]);
  const [totalItems, setTotalItems] = useState(0);
  const [sortField, setSortField] = useState<SortBy>(SortBy.ALUMNI_COUNT);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.DESC);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pageInput, setPageInput] = useState<string>(String(page));

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const { data, isLoading, isFetching } = useCompanyList({
    ...filters,
    limit: itemsPerPage,
    sortBy: sortField,
    sortOrder: sortOrder,
    offset: (page - 1) * itemsPerPage,
  });

  const companies = data?.companies || [];

  // So ugly, try to fix if time allows
  useEffect(() => {
    if (
      data?.alumniCount !== undefined &&
      data?.companyCount !== undefined &&
      data?.alumniFilteredCount !== undefined &&
      data?.companyFilteredCount !== undefined
    ) {
      setTotalItems(data.companyCount);
      onDataUpdate(
        data.alumniCount,
        data.companyCount,
        data.alumniFilteredCount,
        data.companyFilteredCount
      );
    }
  }, [
    data?.alumniCount,
    data?.companyCount,
    data?.alumniFilteredCount,
    data?.companyFilteredCount,
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
  };

  return (
    <div
      className={`w-full ${DASHBOARD_HEIGHT} flex flex-col border rounded-xl shadow-lg p-3 box-border bg-white`}
    >
      <TableTitle
        title="Companies"
        icon={<Building2 className="h-5 w-5 text-[#8C2D19]" />}
        tooltipMessage="Companies that have hired alumni from our programs."
      />

      <div className="flex-1 relative border-t border-b border-gray-200 flex flex-col overflow-hidden">
        <TableContainer className="flex-1 overflow-auto custom-scrollbar">
          <Table className="min-w-full bg-white table-fixed [&>div]:overflow-visible">
            <CustomTableHeader
              includeCompanies={false}
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSort}
            />

            {isLoading || isFetching ? (
              <CompanyDataSkeleton />
            ) : (
              <TableBody className="bg-white divide-y divide-gray-200">
                {companies.length > 0 ? (
                  companies.map(
                    (company: CompanyListItemDto, index: number) => {
                      const rowNumber = (page - 1) * itemsPerPage + index + 1;
                      return (
                        <TableRow
                          key={company.id}
                          className={`group ${
                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                          } hover:bg-[#A13A23] hover:bg-opacity-10 transition-colors duration-200 relative`}
                        >
                          <TableCell className="w-1/12 py-1.5 pl-3 text-sm text-gray-500 font-medium align-middle">
                            {rowNumber}
                          </TableCell>
                          <TableCell className="w-8/12 py-1.5 pl-3 text-sm font-medium text-[#000000] flex items-center gap-1 align-middle">
                            <div className="min-w-[24px] w-6 h-6 mr-1.5 rounded-full overflow-hidden flex items-center justify-center bg-gray-50">
                              <ImageWithFallback
                                src={company.logo || ""}
                                alt={company.name}
                                width={24}
                                height={24}
                                className="rounded-full object-contain w-full h-full"
                              />
                            </div>
                            <Button
                              variant="link"
                              className="text-sm font-medium text-[#000000] w-full text-left h-auto p-1 hover:text-[#8C2D19] transition-colors"
                              onClick={() => {
                                window.open(`/company/${company.id}`, "_blank");
                              }}
                            >
                              <div
                                title={company.name}
                                className="text-ellipsis overflow-hidden w-full text-left"
                              >
                                {company.name}
                              </div>
                            </Button>
                          </TableCell>
                          <TableCell className="w-3/12 px-3 py-1 text-sm text-[#000000] align-middle hover:text-[#8C2D19] transition-colors">
                            <span className="font-semibold">
                              {company.alumniCount}
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
                                    onClick={() => onAddToFilters?.(company.id)}
                                  >
                                    <Filter className="h-4 w-4 text-[#8C2D19]" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Filter on {company.name}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        </TableRow>
                      );
                    }
                  )
                ) : (
                  <NotFoundComponent
                    message="No company data available"
                    description="Try adjusting your filters to find companies that match your criteria."
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
