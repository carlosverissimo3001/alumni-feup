"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { useListFaculties } from "@/hooks/faculty/useListFaculties";
import { useListCourses } from "@/hooks/courses/useListCourses";
import { Card, CardContent } from "@/components/ui/card";
import { useManualSubmission } from "@/hooks/alumni/useManualSubmission";
import { useToast } from "@/hooks/misc/useToast";

// Define a type for course with completion year
interface CourseWithYear {
  id: string;
  name: string;
  startYear: number;
  endYear: number | null;
  conclusionYear: string;
}

const ManualSubmissionForm = () => {
  const { toast } = useToast();
  const router = useRouter();

  // Form state
  const [fullName, setFullName] = useState("");
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState<string | undefined>(
    undefined
  );
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [coursesWithYears, setCoursesWithYears] = useState<CourseWithYear[]>(
    []
  );

  const { data: faculties, isLoading: isLoadingFaculties } = useListFaculties();
  const { data: courses, isLoading: isLoadingCourses } = useListCourses({
    facultyId: selectedFaculty,
    enabled: !!selectedFaculty,
  });
  const { mutate, isPending } = useManualSubmission();

  useEffect(() => {
    if (!courses) {
      if (coursesWithYears.length > 0) {
        setCoursesWithYears([]);
      }
      return;
    }

    const currentCourseMap = new Map(coursesWithYears.map((c) => [c.id, c]));
    const updatedCoursesWithYears: CourseWithYear[] = [];

    selectedCourseIds.forEach((id) => {
      const existingCourse = currentCourseMap.get(id);
      if (existingCourse) {
        updatedCoursesWithYears.push(existingCourse);
      } else {
        const course = courses.find((c) => c.id === id);
        if (course) {
          updatedCoursesWithYears.push({
            id,
            name: `${course.acronym} - ${course.name}`,
            startYear: course.start_year || 0,
            endYear: course.end_year ? Number(course.end_year) : null,
            conclusionYear: "",
          });
        }
      }
    });

    updatedCoursesWithYears.sort(
      (a, b) =>
        selectedCourseIds.indexOf(a.id) - selectedCourseIds.indexOf(b.id)
    );

    if (
      JSON.stringify(updatedCoursesWithYears) !==
      JSON.stringify(coursesWithYears)
    ) {
      setCoursesWithYears(updatedCoursesWithYears);
    }
  }, [selectedCourseIds, courses, coursesWithYears]); // Added coursesWithYears dependency

  const handleYearChange = (courseId: string, year: string) => {
    setCoursesWithYears((prev) =>
      prev.map((course) =>
        course.id === courseId ? { ...course, conclusionYear: year } : course
      )
    );
  };

  const getAvailableYears = (course: CourseWithYear) => {
    const currentYear = new Date().getFullYear();
    const startYear =
      course.startYear && course.startYear > 1900
        ? course.startYear
        : currentYear - 10;
    const endYear = course.endYear || currentYear;
    const years = [];

    const finalEndYear = Math.max(startYear, endYear);

    for (let year = startYear; year <= finalEndYear; year++) {
      years.push(year.toString());
    }

    if (years.length === 0) {
      years.push(currentYear.toString());
    }

    return years;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFaculty) return;

    const dto = {
      fullName,
      linkedinUrl: linkedInUrl,
      personalEmail: personalEmail || null,
      facultyId: selectedFaculty,
      courses: coursesWithYears.map((course) => ({
        courseId: course.id,
        conclusionYear: parseInt(course.conclusionYear),
      })),
    };

    mutate(dto, {
      onSuccess: () => {
        toast({
          title: "Success!",
          description: "Your submission has been received. Welcome to the alumni network!",
          duration: 3000,
        });
        setTimeout(() => {
          router.push('/');
        }, 2000);
      },
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: error.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  // TODO: Use zod to validate the form
  const isFormValid = () => {
    return (
      fullName.trim() !== "" &&
      linkedInUrl.trim() !== "" &&
      selectedFaculty !== undefined &&
      coursesWithYears.length > 0 &&
      selectedCourseIds.length === coursesWithYears.length &&
      coursesWithYears.every((course) => course.conclusionYear !== "")
    );
  };

  return (
    <Card className="w-full max-w-full mx-auto shadow-md">
      <CardContent className="p-8">
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName" className="text-sm font-medium">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="mt-1.5"
                  required
                />
              </div>

              <div>
                <Label htmlFor="linkedInUrl" className="text-sm font-medium">
                  LinkedIn URL <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="linkedInUrl"
                  value={linkedInUrl}
                  onChange={(e) => setLinkedInUrl(e.target.value)}
                  placeholder="https://www.linkedin.com/in/your-profile"
                  className="mt-1.5"
                  required
                />
              </div>

              <div>
                <Label htmlFor="personalEmail" className="text-sm font-medium">
                  Personal Email <span className="text-xs text-muted-foreground">(Optional)</span>
                </Label>
                <Input
                  id="personalEmail"
                  value={personalEmail}
                  onChange={(e) => setPersonalEmail(e.target.value)}
                  placeholder="your@email.com"
                  type="email"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="faculty" className="text-sm font-medium">
                  Faculty <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedFaculty}
                  onValueChange={setSelectedFaculty}
                  disabled={isLoadingFaculties}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select your faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties?.map((faculty) => (
                      <SelectItem key={faculty.id} value={faculty.id}>
                        {faculty.acronym} - {faculty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  Completed Courses <span className="text-destructive">*</span>
                </Label>
                <div className="mt-1.5">
                  <MultiSelect
                    value={selectedCourseIds}
                    onChange={setSelectedCourseIds}
                    options={
                      courses?.map((course) => ({
                        value: course.id,
                        label: `${course.acronym} - ${course.name}`,
                      })) || []
                    }
                    placeholder="Select your courses"
                    disabled={!selectedFaculty || isLoadingCourses}
                  />
                </div>
              </div>

              {coursesWithYears.length > 0 && (
                <div className="space-y-3 pt-2">
                  <Label className="text-sm font-medium">
                    Completion Years <span className="text-destructive">*</span>
                  </Label>
                  {coursesWithYears.map((course) => (
                    <div key={course.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{course.name}</p>
                      </div>
                      <Select
                        value={course.conclusionYear}
                        onValueChange={(year) => handleYearChange(course.id, year)}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableYears(course).map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!isFormValid() || isPending}
            >
              {isPending ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManualSubmissionForm;
