"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableHeader,
  TableContainer,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useCompanyList } from "@/hooks/analytics/useCompanyList";
import { CompanyListItemDto } from "@/sdk";
import { Building2 } from "lucide-react";
import ImageWithFallback from "../ui/image-with-fallback";
import PaginationControls from "./common/PaginationControls";
import { CompanyDataSkeleton } from "./skeletons/CompanyDataSkeleton";
import TableTitle from "./common/TableTitle";

const ITEMS_PER_PAGE = [5, 10, 25, 50, 100];
const DASHBOARD_HEIGHT = "h-[375px]";

type CompanyDashboardProps = {
  onDataUpdate: (alumniCount: number, companyCount: number) => void;
};

export default function CompanyDashboard({
  onDataUpdate,
}: CompanyDashboardProps) {
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE[2]);
  const [totalItems, setTotalItems] = useState(0);

  // 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pageInput, setPageInput] = useState<string>(String(page));

  const { data, isLoading, isFetching } = useCompanyList({
    limit: itemsPerPage,
    sortBy: "alumniCount",
    sortOrder: "desc",
    offset: (page - 1) * itemsPerPage,
  });

  const companies = data?.companies || [];

  useEffect(() => {
    if (data) {
      setTotalItems(data?.companyTotalCount || 0);
      onDataUpdate(data?.alumniTotalCount || 0, data?.companyTotalCount || 0);
    }
  }, [data, onDataUpdate]);

  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  return (
    <div
      className={`w-full ${DASHBOARD_HEIGHT} flex flex-col border rounded-xl shadow-lg p-3 box-border bg-white`}
    >
      <TableTitle
        title="Companies"
        icon={<Building2 className="h-5 w-5 text-[#8C2D19]" />}
      />

      <div className="flex-1 overflow-y-auto mb-2 relative border-t border-b border-gray-200 custom-scrollbar">
        <TableContainer className="w-full h-full">
          <Table className="min-w-full bg-white table-fixed">
            <TableHeader className="bg-gray-100 sticky top-0 z-20 shadow-sm">
              <TableRow>
                <TableHead className="w-1/12 pl-3 py-1 text-left text-xs font-semibold text-[#8C2D19] uppercase tracking-wider">
                  #
                </TableHead>
                <TableHead className="w-8/12 pl-3 py-1 text-left text-xs font-semibold text-[#8C2D19] uppercase tracking-wider">
                  Name
                </TableHead>
                <TableHead className="w-3/12 pl-3 py-1 text-left text-xs font-semibold text-[#8C2D19] uppercase tracking-wider">
                  Alumni
                </TableHead>
              </TableRow>
            </TableHeader>

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
                          className={`${
                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                          } hover:bg-[#A13A23] hover:bg-opacity-10 transition-colors duration-200`}
                        >
                          <TableCell className="w-1/12 py-1 pl-3 text-sm text-gray-500 font-medium align-middle">
                            {rowNumber}
                          </TableCell>
                          <TableCell className="w-8/12 py-1 pl-3 text-sm font-medium text-[#000000] flex items-center gap-1 align-middle">
                            <div className="min-w-[24px] w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-gray-50">
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
                              className="text-sm font-medium text-[#000000] w-full text-left h-auto p-0 hover:text-[#8C2D19] transition-colors"
                              onClick={() => {
                                window.open(`/company/${company.id}`, "_blank");
                              }}
                            >
                              <div className="text-ellipsis overflow-hidden w-full text-left">
                                {company.name}
                              </div>
                            </Button>
                          </TableCell>
                          <TableCell className="w-3/12 px-3 py-1 text-sm text-[#000000] align-middle hover:text-[#8C2D19] transition-colors">
                            <span className="font-semibold">
                              {company.alumniCount}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    }
                  )
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3} // Updated to account for the new column
                      className="text-center text-[#000000] py-4"
                    >
                      No company data available.
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