import { useState } from 'react';
/* import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'; */

export function Filters() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    /* <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full h-full">
      <CollapsibleTrigger className="bg-gray-200 p-2 rounded-md text-sm">
        {isOpen ? 'Filters' : 'Filters'}
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col gap-4 border-2 border-gray-200 rounded-md p-4">
      </CollapsibleContent>
    </Collapsible> */
    <div className="w-full h-full border-2 border-gray-200 rounded-md p-4 grid grid-cols-3 gap-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-10 rounded-md p-2">
          Filter {index + 1}
        </div>
      ))}
    </div>
  );
}