"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { CountryListItemDto } from "@/sdk";
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

const ITEMS_PER_PAGE = [5, 10, 25, 50, 100];
const DASHBOARD_HEIGHT = "h-[375px]";

type CountryDashboardProps = {
  onDataUpdate: (countryCount: number) => void;
};

export default function CountryDashboard({
  onDataUpdate,
}: CountryDashboardProps) {
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE[2]);
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pageInput, setPageInput] = useState<string>(String(page));

  const { data, isLoading, isFetching } = useCountryList({
    limit: itemsPerPage,
    sortBy: "alumniCount",
    sortOrder: "desc",
    offset: (page - 1) * itemsPerPage,
  });

  const countries = data?.countries || [];
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
            <CustomTableHeader />

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
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-[#000000] py-4"
                    >
                      No country data available.
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
