import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { TableContainer } from "@/components/ui/table";
import { ViewType } from "@/types/view";
import CustomTableHeader from "./CustomTableHeader";
import { DashboardSkeleton } from "../skeletons/DashboardSkeleton";
import { Button } from "@/components/ui/button";
import ImageWithFallback from "@/components/ui/image-with-fallback";
import CountComponent from "./CountComponent";
import TrendLineComponent from "./TrendLineComponent";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Filter } from "lucide-react";
import { NotFoundComponent } from "./NotFoundComponent";
import PaginationControls from "./PaginationControls";
import { SortBy, SortOrder } from "@/consts";
import { TrendFrequency } from "@/types/entityTypes";

type TableViewProps = {
  // Data and loading states
  data: any[];
  isLoading: boolean;
  isFetching?: boolean;

  // Pagination
  page: number;
  setPage: (page: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (itemsPerPage: number) => void;
  totalItems: number;

  // View and sorting
  view: ViewType;
  sortField: SortBy;
  sortOrder: SortOrder;
  onSort: (field: SortBy) => void;
  trendFrequency: TrendFrequency;
  setTrendFrequency: (frequency: TrendFrequency) => void;

  // Customization
  entityType: string;
  onAddToFilters?: (id: string) => void;
  getItemLink?: (item: any) => string;
  getItemName?: (item: any) => string;
  getItemLogo?: (item: any) => string;
  getItemCount?: (item: any) => number;
  getItemTrend?: (item: any) => any[];
  notFoundMessage?: string;
  notFoundDescription?: string;
};

export const TableView = ({
  data,
  isLoading,
  isFetching,
  page,
  setPage,
  itemsPerPage,
  setItemsPerPage,
  totalItems,
  view,
  sortField,
  sortOrder,
  onSort,
  trendFrequency,
  setTrendFrequency,
  entityType,
  onAddToFilters,
  getItemLink = (item) => `/${entityType.toLowerCase()}/${item.id}`,
  getItemName = (item) => item.name,
  getItemLogo = (item) => item.logo || "",
  getItemCount = (item) => item.count,
  getItemTrend = (item) => item.trend,
}: TableViewProps) => {
  const notFoundMessage = `No ${entityType.toLowerCase()} data available`;
  const notFoundDescription = `Try adjusting your filters to find ${entityType.toLowerCase()}s that match your criteria.`;
  
  return (
    <>
      <div className="flex-1 relative border-t border-b border-gray-200 flex flex-col overflow-hidden">
        <TableContainer className="flex-1 overflow-auto custom-scrollbar">
          <Table className="min-w-full bg-white table-fixed [&>div]:overflow-visible">
            <CustomTableHeader
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={onSort}
              showTrend={view === ViewType.TREND}
              trendFrequency={trendFrequency}
            />

            {isLoading || isFetching ? (
              <DashboardSkeleton />
            ) : (
              <TableBody className="bg-white divide-y divide-gray-200">
                {data.length > 0 ? (
                  data.map((item: any, index: number) => {
                    const rowNumber = (page - 1) * itemsPerPage + index + 1;
                    return (
                      <TableRow
                        key={item.id}
                        className={`group ${
                          index % 2 === 0 ? "bg-gray-50" : "bg-white"
                        } hover:bg-[#A13A23] hover:bg-opacity-10 transition-colors duration-200 relative items-center`}
                      >
                        <TableCell className="w-[3%] py-1.5 pl-3 text-sm text-gray-500 font-medium align-middle">
                          {rowNumber}
                        </TableCell>
                        <TableCell className="w-[85%] py-1.5 pl-3 text-sm font-medium text-[#000000] flex items-center gap-1 align-middle">
                          <div className="min-w-[24px] w-6 h-6 mr-1.5 rounded-full overflow-hidden flex items-center justify-center bg-gray-50">
                            <ImageWithFallback
                              src={getItemLogo(item)}
                              alt={getItemName(item)}
                              width={24}
                              height={24}
                              className="rounded-full object-contain w-full h-full"
                            />
                          </div>
                          <Button
                            variant="link"
                            className="text-sm font-medium text-[#000000] w-full text-left h-auto p-1 hover:text-[#8C2D19] transition-colors flex items-center"
                            onClick={() => {
                              window.open(getItemLink(item), "_blank");
                            }}
                          >
                            <div
                              title={getItemName(item)}
                              className="text-ellipsis overflow-hidden w-full text-left"
                            >
                              {getItemName(item)}
                            </div>
                          </Button>
                        </TableCell>
                        <TableCell className="w-[12%] px-3 py-1 text-sm text-[#000000] align-middle hover:text-[#8C2D19] transition-colors relative">
                          <div className="flex items-center gap-0 justify-center">
                            {view === ViewType.TABLE ? (
                              <CountComponent count={getItemCount(item)} />
                            ) : (
                              <TrendLineComponent
                                dataPoints={getItemTrend(item)}
                                trendFrequency={trendFrequency}
                              />
                            )}
                            {onAddToFilters && (
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
                                        onClick={() => onAddToFilters(item.id)}
                                      >
                                        <Filter className="h-4 w-4 text-[#8C2D19]" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Filter on {getItemName(item)}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <NotFoundComponent
                    message={notFoundMessage}
                    description={notFoundDescription}
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
        visible={data.length > 0}
        showTrendFrequency={view === ViewType.TREND}
        trendFrequency={trendFrequency}
        setTrendFrequency={setTrendFrequency}
      />
    </>
  );
};
