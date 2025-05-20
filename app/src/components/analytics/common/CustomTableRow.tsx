import { TableRow as UITableRow } from "@/components/ui/table";
import { HTMLAttributes } from "react";

type CustomTableRowProps = HTMLAttributes<HTMLTableRowElement> & {
  index: number;
  isLoggedUser?: boolean;
  children: React.ReactNode;
};

export const CustomTableRow = ({
  index,
  children,
  className = "",
  isLoggedUser = false,
  ...props
}: CustomTableRowProps) => {
  return (
    <UITableRow
      {...props}
      className={`group ${
        index % 2 === 0 ? "bg-gray-50/50" : "bg-white"
      } hover:bg-gradient-to-r from-[#A13A23]/5 to-gray-50 hover:shadow-md transition-all duration-200 relative items-center ${className} ${
        isLoggedUser
          ? "!bg-[#FFF3F0] hover:!bg-[#FFE6E0] border-l-2 !border-[#A13A23] !border-b-2 !border-t-2 border-r-2 hover:shadow-md"
          : ""
      }`}
    >
      {children}
    </UITableRow>
  );
};
