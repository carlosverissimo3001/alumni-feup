// Note: One day, rename this to DegreeSelect to avoid confusion

import { MultiSelect } from "../ui/multi-select";
import { Course } from "@/sdk";

type CourseSelectProps = {
  courses: Course[];
  setCourseIds: (courseIds: string[]) => void;
  isLoadingCourses: boolean;
  courseIds: string[];
};

export const CourseSelect = ({ courses, setCourseIds, isLoadingCourses, courseIds }: CourseSelectProps) => {
  return (
    <MultiSelect
      options={Array.isArray(courses) ? courses.map((course) => ({
        label: `${course.acronym} - ${course.name}`,
        value: course.id,
      })) : []}
        onValueChange={(values) => setCourseIds(values || [])}
        value={courseIds}
        placeholder={isLoadingCourses ? "Loading degrees..." : "Select degree"}
        variant="inverted"
        maxCount={4}
        disabled={isLoadingCourses}
    />
  );
};
