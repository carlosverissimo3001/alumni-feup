import { MultiSelect } from "../ui/multi-select";
import { Faculty } from "@/sdk";

type FacultySelectProps = {
  faculties: Faculty[];
  setFacultyIds: (facultyIds: string[]) => void;
  isLoadingFaculties: boolean;
  facultyIds: string[];
};

export const FacultySelect = ({ faculties, setFacultyIds, isLoadingFaculties, facultyIds }: FacultySelectProps) => {
  return (
    <MultiSelect
      options={Array.isArray(faculties) ? faculties.map((faculty) => ({
        label: faculty.name,
        value: faculty.id,
      })) : []}
        onValueChange={(values) => setFacultyIds(values || [])}
        value={facultyIds}
        placeholder={isLoadingFaculties ? "Loading faculties..." : "Select faculty"}
        variant="inverted"
        maxCount={4}
        disabled={isLoadingFaculties || !Array.isArray(faculties)}
    />
  );
};
