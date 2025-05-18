import { Button } from "@/components/ui/button";
import ImageWithFallback from "@/components/ui/image-with-fallback";
import { TableCell } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DollarSign } from "lucide-react";

type TableNameCellProps = {
  name: string;
  isRowInFilters: boolean;
  acronym?: string;
  logo?: string;
  logoType?: "company" | "location";
  pageUrl?: string;
  salaryDataUrl?: string;
};

const NameContent = ({
  name,
  acronym,
  forTooltip = false,
  isRowInFilters = false,
}: {
  name: string;
  acronym?: string;
  forTooltip?: boolean;
  isRowInFilters?: boolean;
}) =>
  acronym ? (
    <>
      <span
        className={`${!forTooltip && isRowInFilters ? "text-[#8C2D19] " : ""}`}
      >
        {acronym}
      </span>
      <span
        className={`font-normal ${
          !forTooltip && isRowInFilters ? "text-[#8C2D19]" : ""
        }`}
      >
        {" "}
        - {name}
      </span>
    </>
  ) : (
    <span
      className={`${!forTooltip && isRowInFilters ? "text-[#8C2D19]" : ""}`}
    >
      {name}
    </span>
  );

const NameWithTooltip = ({
  name,
  acronym,
  children,
}: {
  name: string;
  acronym?: string;
  children: React.ReactNode;
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <p>
            <NameContent name={name} acronym={acronym} forTooltip={true} />
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const LogoSection = ({
  logo,
  name,
  logoType,
}: {
  logo: string;
  name: string;
  logoType?: "company" | "location";
}) => (
  <div className="min-w-[24px] w-6 h-6 mr-1.5 rounded-full overflow-hidden flex items-center justify-center bg-gray-50">
    <ImageWithFallback
      src={logo}
      alt={name}
      width={24}
      height={24}
      fallbackSrc={
        logoType === "company"
          ? "/images/no-logo.png"
          : "/images/no-location.png"
      }
    />
  </div>
);

export const TableNameCell = ({
  name,
  isRowInFilters,
  acronym,
  logo,
  logoType,
  pageUrl,
  salaryDataUrl,
}: TableNameCellProps) => {
  const baseClassName = `py-1.5 w-full text-sm flex items-center gap-1 align-middle`;

  if (!logo) {
    return (
      <TableCell className={baseClassName}>
        <div className="w-full">
          <NameWithTooltip name={name} acronym={acronym}>
            <div
              className={`text-ellipsis overflow-hidden whitespace-nowrap w-full text-left p-1 ${
                isRowInFilters ? "font-bold" : "font-medium"
              }`}
            >
              <NameContent
                name={name}
                acronym={acronym}
                isRowInFilters={isRowInFilters}
              />
            </div>
          </NameWithTooltip>
        </div>
      </TableCell>
    );
  }

  return (
    <TableCell className={baseClassName}>
      <LogoSection logo={logo} name={name} logoType={logoType} />
      <div className="flex flex-1 min-w-0 overflow-hidden">
        <div className="flex items-center flex-1 min-w-0">
          <NameWithTooltip name={name} acronym={acronym}>
            <Button
              variant="link"
              className={`text-sm h-auto p-1 hover:text-[#8C2D19] transition-colors group-hover:text-[#8C2D19] min-w-0 flex-1 justify-start ${
                isRowInFilters ? "text-[#8C2D19]" : ""
              }`}
              onClick={() => window.open(pageUrl, "_blank")}
            >
              <div
                className={`truncate text-left ${
                  isRowInFilters ? "font-bold" : "font-medium"
                }`}
              >
                <NameContent
                  name={name}
                  acronym={acronym}
                  isRowInFilters={isRowInFilters}
                />
              </div>
            </Button>
          </NameWithTooltip>
          {salaryDataUrl && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="h-4 w-4 ml-1 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-[#8C2D19] shrink-0"
                    onClick={() => window.open(salaryDataUrl, "_blank")}
                  >
                    <DollarSign className="h-4 w-4 animate-pulse  bg-clip-text bg-gradient-to-r from-green-400 to-yellow-400" />{" "}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View Salary Insights on Levels.fyi for {name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </TableCell>
  );
};
