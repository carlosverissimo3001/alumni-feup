import { Faculty } from "@/sdk";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { Button } from "../ui/button";

type FacultyTableProps = {
  faculties?: Faculty[];
  isLoadingFaculties: boolean;
};

type SortKey = 'name' | 'nameInt' | 'acronym';
type SortDirection = 'asc' | 'desc';

export default function FacultyTable({
  faculties,
  isLoadingFaculties,
}: FacultyTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedFaculties = faculties && [...faculties].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    switch (sortKey) {
      case 'name':
        return direction * a.name.localeCompare(b.name);
      case 'nameInt':
        // Handle potential null/undefined values for nameInt
        if (!a.nameInt) return direction;
        if (!b.nameInt) return -direction;
        return direction * String(a.nameInt).localeCompare(String(b.nameInt));
      case 'acronym':
        return direction * a.acronym.localeCompare(b.acronym);
      default:
        return 0;
    }
  });

  return (
    <Card className="shadow-lg border border-gray-200 rounded-lg">
      <CardHeader className="py-4">
        <CardTitle className="text-xl text-[#8C2D19]">
          Faculties {faculties && faculties.length > 0 && `(${faculties.length})`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingFaculties ? (
          <div className="flex justify-center py-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#8C2D19] border-t-transparent"></div>
          </div>
        ) : faculties && faculties.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-2 px-3 text-[#8C2D19] text-sm">
                    <Button 
                      variant="ghost" 
                      className="p-0 h-auto font-semibold text-[#8C2D19] text-sm hover:bg-transparent hover:text-[#A13A23] focus:ring-0"
                      onClick={() => handleSort('name')}
                    >
                      Name
                      <ArrowUpDown size={16} className="ml-1" />
                    </Button>
                  </th>
                  <th className="text-left py-2 px-3 text-[#8C2D19] text-sm">
                    <Button 
                      variant="ghost" 
                      className="p-0 h-auto font-semibold text-[#8C2D19] text-sm hover:bg-transparent hover:text-[#A13A23] focus:ring-0"
                      onClick={() => handleSort('nameInt')}
                    >
                      International Name
                      <ArrowUpDown size={16} className="ml-1" />
                    </Button>
                  </th>
                  <th className="text-left py-2 px-3 text-[#8C2D19] text-sm">
                    <Button 
                      variant="ghost" 
                      className="p-0 h-auto font-semibold text-[#8C2D19] text-sm hover:bg-transparent hover:text-[#A13A23] focus:ring-0"
                      onClick={() => handleSort('acronym')}
                    >
                      Acronym
                      <ArrowUpDown size={16} className="ml-1" />
                    </Button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedFaculties?.map((faculty: Faculty) => (
                  <tr
                    key={faculty.id}
                    className="border-b hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="py-2 px-3 text-gray-700 text-sm">
                      {faculty.name}
                    </td>
                    <td className="py-2 px-3 text-gray-700 text-sm">
                      {faculty.nameInt ? String(faculty.nameInt) : "-"}
                    </td>
                    <td className="py-2 px-3 font-medium text-gray-700 bol">
                      {faculty.acronym}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            No faculties found. Add a faculty to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
