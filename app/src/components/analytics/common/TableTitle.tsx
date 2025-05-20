import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type TableTitleProps = {
  title: string;
  icon: React.ReactNode;
  tooltipMessage?: string;
  className?: string;
  children?: React.ReactNode;
};

export default function TableTitle({
  title,
  icon,
  tooltipMessage,
  className,
  children,
}: TableTitleProps) {
  return (
    <div className={`inline-flex items-center ${className}`}>
      {tooltipMessage ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="flex items-center">
              {icon}
            </TooltipTrigger>
            <TooltipContent align="start">{tooltipMessage}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        icon
      )}
      <span className="ml-2 text-md font-bold text-[#8C2D19]">{title}</span>
      {children}
    </div>
  );
}
