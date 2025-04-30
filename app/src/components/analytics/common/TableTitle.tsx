import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type TableTitleProps = {
  title: string;
  icon: React.ReactNode;
  tooltipMessage?: string;
};

export default function TableTitle({ title, icon, tooltipMessage }: TableTitleProps) {
  return (
    <h1 className="text-md font-bold text-[#8C2D19] mb-2 flex items-center gap-2 pl-2 pb-1 flex-shrink-0">
      <TooltipProvider> 
        <Tooltip> 
          <TooltipTrigger>
            {icon}
          </TooltipTrigger>
          <TooltipContent>
            {tooltipMessage}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {title}
    </h1>
  );
}
