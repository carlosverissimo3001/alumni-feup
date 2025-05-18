import { TableRow as UITableRow } from "@/components/ui/table";
import { HTMLAttributes } from "react";

type CustomTableRowProps = HTMLAttributes<HTMLTableRowElement> & {
  index: number;
  children: React.ReactNode;
};

export const CustomTableRow = ({
  index,
  children,
  className = "",
  ...props
}: CustomTableRowProps) => {
  return (
    <UITableRow
      {...props}
      className={`group ${
        index % 2 === 0 ? "bg-gray-50/50" : "bg-white"
      } hover:bg-gradient-to-r from-[#A13A23]/5 to-gray-50 hover:shadow-md transition-all duration-200 relative items-center ${className}`}
    >
      {children}
    </UITableRow>
  );
};
