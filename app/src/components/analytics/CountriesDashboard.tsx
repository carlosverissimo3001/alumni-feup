"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  TableHeader,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { IndustryListItemDto } from "@/sdk";
import { Flag } from "lucide-react";
import { IndustryDataSkeleton } from "./skeletons/IndustryDataSkeleton";
import { useIndustryList } from "@/hooks/analytics/useIndustryList";
import PaginationControls from "./common/PaginationControls";
import TableTitle from "./common/TableTitle";

const ITEMS_PER_PAGE = [5, 10, 25, 50, 100];
const DASHBOARD_HEIGHT = "h-[350px]";

type IndustryDashboardProps = {
  onDataUpdate: (industryCount: number) => void;
};

export default function IndustryDashboard({
  onDataUpdate,
}: IndustryDashboardProps) {
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE[2]);
  const [pageInput, setPageInput] = useState<string>(String(page));

  const { data, isLoading, isFetching } = useIndustryList({
    limit: itemsPerPage,
    sortBy: "alumniCount",
    sortOrder: "desc",
    offset: (page - 1) * itemsPerPage,
  });

  const industries = data?.industries || [];
  const totalItems = data?.total || 0;

  useEffect(() => {
    if (data) {
      onDataUpdate(data?.total || 0);
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
        title="Countries"
        icon={<Flag className="h-5 w-5 text-[#8C2D19]" />}
      />

      <div className="flex-1 overflow-y-auto mb-2 relative border-t border-b border-gray-200 custom-scrollbar">
        <TableContainer className="w-full h-full">
          <Table className="min-w-full bg-white table-fixed">
            <TableHeader className="bg-gray-100 sticky top-0 z-20 shadow-sm">
              <TableRow>
                <TableHead className="w-1/12 pl-3 py-0.5 text-left text-xs font-semibold text-[#8C2D19] uppercase tracking-wider">
                  #
                </TableHead>
                <TableHead className="w-5/12 pl-3 py-0.5 text-left text-xs font-semibold text-[#8C2D19] uppercase tracking-wider">
                  Name
                </TableHead>
                <TableHead className="w-3/12 pl-3 py-0.5 text-left text-xs font-semibold text-[#8C2D19] uppercase tracking-wider">
                  Companies
                </TableHead>
                <TableHead className="w-3/12 pl-3 py-0.5 text-left text-xs font-semibold text-[#8C2D19] uppercase tracking-wider">
                  Alumni
                </TableHead>
              </TableRow>
            </TableHeader>

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
                          <TableCell className="w-1/12 py-0.5 pl-3 text-sm text-gray-500 font-medium">
                            {rowNumber}
                          </TableCell>
                          <TableCell className="w-5/12 py-0.5 pl-3 text-sm font-medium text-[#000000]">
                            <Button
                            variant="link"
                            className="text-sm font-medium text-[#000000] w-full"
                              onClick={() => {
                                window.open(`/industry/${industry.id}`, "_blank");
                              }}
                            >
                              <div className="text-ellipsis overflow-hidden w-full text-left">
                                {industry.name}
                              </div>
                            </Button>
                          </TableCell>
                          <TableCell className="w-3/12 pl-3 py-0.5 text-sm text-[#000000]">
                            <span className="font-semibold">
                              {industry.companyCount}
                            </span>
                          </TableCell>
                          <TableCell className="w-3/12 pl-3 py-0.5 text-sm text-[#000000]">
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
                      colSpan={4} // Update colSpan to account for the new column
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