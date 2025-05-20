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

type ImageType = "company" | "location" | "alumni";

type TableNameCellProps = {
  name: string;
  isRowInFilters: boolean;
  acronym?: string;
  image?: string;
  imageType?: ImageType;
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

const getPlaceholderImage = (imageType: ImageType | undefined) => {
  if (!imageType) {
    return "/images/placeholder/no-image.png";
  }
  switch (imageType) {
    case "company":
      return "/images/placeholders/no-logo.png";
    case "location":
      return "/images/placeholders/no-location.png";
    case "alumni":
      return "/images/placeholders/no-user.png";
    default:
      return "/images/placeholders/no-image.png";
  }
};

const LogoSection = ({
  image,
  name,
  imageType,
}: {
  image?: string;
  name: string;
  imageType?: ImageType;
}) => {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-w-[24px] w-6 h-6 mr-1 rounded-full overflow-hidden flex items-center justify-center bg-gray-50">
      {image ? (
        <ImageWithFallback
          src={image}
          alt={name}
          width={24}
          height={24}
          fallbackSrc={getPlaceholderImage(imageType)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 text-[10px] font-semibold border border-gray-200">
          {initials}
        </div>
      )}
    </div>
  );
};

export const TableNameCell = ({
  name,
  isRowInFilters,
  acronym,
  image,
  imageType,
  pageUrl,
  salaryDataUrl,
}: TableNameCellProps) => {
  const baseClassName = `w-full text-sm flex items-center pl-1`;

  if (!imageType) {
    return (
      <TableCell className="py-2.5 align-middle">
        <div className={baseClassName}>
          <NameWithTooltip name={name} acronym={acronym}>
            <div
              className={`text-ellipsis overflow-hidden whitespace-nowrap w-full text-left ${
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
    <TableCell className="py-1.5 align-middle">
      <div className={`${baseClassName} gap-1.5`}>
        <LogoSection image={image} name={name} imageType={imageType} />
        <div className="flex flex-1 min-w-0">
          <div className="flex items-center flex-1 min-w-0">
            <Button
              variant="link"
              className={`text-sm h-auto p-1 hover:text-[#8C2D19] transition-colors group-hover:text-[#8C2D19] min-w-0 flex-1 justify-start ${
                isRowInFilters ? "text-[#8C2D19]" : ""
              }`}
              onClick={() => window.open(pageUrl, "_blank")}
            >
              <NameWithTooltip name={name} acronym={acronym}>
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
              </NameWithTooltip>
            </Button>
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
      </div>
    </TableCell>
  );
};
