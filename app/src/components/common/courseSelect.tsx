import { MultiSelect } from "../ui/multi-select";
import { CourseExtended } from "@/sdk";

type CourseSelectProps = {
  courses: CourseExtended[];
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
        placeholder={isLoadingCourses ? "Loading courses..." : "Select course"}
        variant="inverted"
        maxCount={4}
        disabled={isLoadingCourses}
    />
  );
};
