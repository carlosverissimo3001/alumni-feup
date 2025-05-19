import { CourseAnalyticsEntity as Course, Faculty } from "@/sdk";
import { CourseAnalyticsEntityStatusEnum as CourseStatusEnum } from "@/sdk";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { SelectContent, SelectItem, SelectValue } from "../ui/select";
import { SelectTrigger } from "../ui/select";
import { Select } from "../ui/select";
import { useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

type CourseTableProps = {
  courses?: Course[];
  isLoadingCourses: boolean;
  filterFacultyId: string;
  setFilterFacultyId: (facultyId: string) => void;
  faculties?: Faculty[];
};

type SortKey = "name" | "acronym" | "courseType" | "status" | "startYear";
type SortDirection = "asc" | "desc";

export default function CourseTable({
  courses,
  isLoadingCourses,
  filterFacultyId,
  setFilterFacultyId,
  faculties,
}: CourseTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("startYear");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const sortedCourses =
    courses &&
    [...courses].sort((a, b) => {
      const direction = sortDirection === "asc" ? 1 : -1;

      switch (sortKey) {
        case "name":
          return direction * a.name.localeCompare(b.name);
        case "acronym":
          return direction * a.acronym.localeCompare(b.acronym);
        case "courseType":
          return (
            direction * String(a.courseType).localeCompare(String(b.courseType))
          );
        case "status":
          return direction * String(a.status).localeCompare(String(b.status));
        case "startYear":
          return direction * (a.startYear - b.startYear);
        default:
          return 0;
      }
    });

  const formatCourseType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <Card className="shadow-lg border border-gray-200 rounded-lg">
      <CardHeader className="py-4">
        <CardTitle className="flex items-center justify-between text-xl text-[#8C2D19]">
          <span>
            Courses {courses && courses.length > 0 && `(${courses.length})`}
          </span>
          <div className="w-64">
            <Select value={filterFacultyId} onValueChange={setFilterFacultyId}>
              <SelectTrigger className="border-gray-300 focus:border-[#A13A23] focus:ring focus:ring-[#A13A23]/20 transition-all duration-200">
                <SelectValue placeholder="Filter by faculty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Faculties</SelectItem>
                {faculties?.map((faculty: Faculty) => (
                  <SelectItem key={faculty.id} value={faculty.id}>
                    {faculty.acronym} - {faculty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingCourses ? (
          <div className="flex justify-center py-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#8C2D19] border-t-transparent"></div>
          </div>
        ) : courses && courses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-2 px-3 text-[#8C2D19] text-sm">
                    <Button
                      variant="ghost"
                      className="p-0 h-auto font-semibold text-[#8C2D19] text-sm hover:bg-transparent hover:text-[#A13A23] focus:ring-0"
                      onClick={() => handleSort("name")}
                    >
                      Name
                      <ArrowUpDown size={16} className="ml-1" />
                    </Button>
                  </th>
                  <th className="text-left py-2 px-3 text-[#8C2D19] text-sm">
                    <Button
                      variant="ghost"
                      className="p-0 h-auto font-semibold text-[#8C2D19] text-sm hover:bg-transparent hover:text-[#A13A23] focus:ring-0"
                      onClick={() => handleSort("acronym")}
                    >
                      Acronym
                      <ArrowUpDown size={16} className="ml-1" />
                    </Button>
                  </th>
                  <th className="text-left py-2 px-3 text-[#8C2D19] text-sm">
                    <Button
                      variant="ghost"
                      className="p-0 h-auto font-semibold text-[#8C2D19] text-sm hover:bg-transparent hover:text-[#A13A23] focus:ring-0"
                      onClick={() => handleSort("courseType")}
                    >
                      Type
                      <ArrowUpDown size={16} className="ml-1" />
                    </Button>
                  </th>
                  <th className="text-left py-2 px-3 text-[#8C2D19] text-sm">
                    <Button
                      variant="ghost"
                      className="p-0 h-auto font-semibold text-[#8C2D19] text-sm hover:bg-transparent hover:text-[#A13A23] focus:ring-0"
                      onClick={() => handleSort("status")}
                    >
                      Status
                      <ArrowUpDown size={16} className="ml-1" />
                    </Button>
                  </th>
                  <th className="text-left py-2 px-3 text-[#8C2D19] text-sm">
                    <Button
                      variant="ghost"
                      className="p-0 h-auto font-semibold text-[#8C2D19] text-sm hover:bg-transparent hover:text-[#A13A23] focus:ring-0"
                      onClick={() => handleSort("startYear")}
                    >
                      <div className="flex flex-row gap-2 items-center">
                        <span className="text-[#8C2D19] text-sm">
                          Start Year
                        </span>
                        <span className="text-[#948f8e] text-xs">
                          (End Year)
                        </span>
                        <ArrowUpDown size={16} className="ml-1" />
                      </div>
                    </Button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedCourses?.map((course: Course) => (
                  <tr
                    key={course.id}
                    className="border-b hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="py-2 px-3 text-gray-700 text-sm">
                      {course.name}
                    </td>
                    <td className="py-2 px-3 text-gray-700 text-sm font-medium">
                      {course.acronym}
                    </td>
                    <td className="py-2 px-3 text-gray-700 text-sm">
                      {formatCourseType(String(course.courseType))}
                    </td>
                    <td className="py-2 px-3 text-gray-700 text-sm">
                      <Badge
                        variant={
                          course.status === CourseStatusEnum.Active
                            ? "default"
                            : "secondary"
                        }
                        className={
                          course.status === CourseStatusEnum.Active
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }
                      >
                        {course.status === CourseStatusEnum.Active
                          ? "Active"
                          : "Inactive"}
                      </Badge>
                    </td>
                    <td className="py-2 px-3 text-gray-700 text-sm">
                      {course.startYear}{" "}
                      {course.endYear ? `(${course.endYear})` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            No courses found.{" "}
            {filterFacultyId !== "all"
              ? "Try changing the faculty filter or adding a new course."
              : "Add a course to get started."}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
