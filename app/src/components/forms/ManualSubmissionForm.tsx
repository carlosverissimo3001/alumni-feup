"use client";

import { useState, useEffect } from "react";
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

// Define a type for course with completion year
interface CourseWithYear {
  id: string;
  name: string;
  startYear: number;
  endYear: number | null;
  conclusionYear: string;
}

const ManualSubmissionForm = () => {
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
      personalEmail,
      facultyId: selectedFaculty,
      courses: coursesWithYears.map((course) => ({
        courseId: course.id,
        conclusionYear: parseInt(course.conclusionYear),
      })),
    };

    mutate(dto);
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
    <Card className="w-full max-w-3xl mx-auto shadow-md">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div>
            <Label htmlFor="linkedInUrl">LinkedIn URL *</Label>
            <Input
              id="linkedInUrl"
              value={linkedInUrl}
              onChange={(e) => setLinkedInUrl(e.target.value)}
              placeholder="https://www.linkedin.com/in/your-profile"
              required
            />
          </div>
          <div>
            <Label htmlFor="personalEmail">Personal Email (Optional)</Label>
            <Input
              id="personalEmail"
              type="email"
              value={personalEmail}
              required={false}
              onChange={(e) => setPersonalEmail(e.target.value)}
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <Label htmlFor="faculty">Faculty *</Label>
            <Select
              onValueChange={(value) => {
                setSelectedFaculty(value);
                setSelectedCourseIds([]);
              }}
              disabled={isLoadingFaculties}
              value={selectedFaculty || ""}
            >
              <SelectTrigger id="faculty">
                <SelectValue
                  placeholder={
                    isLoadingFaculties
                      ? "Loading faculties..."
                      : "Choose a faculty"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {faculties?.map((faculty) => (
                  <SelectItem key={faculty.id} value={faculty.id}>
                    {faculty.acronym
                      ? `${faculty.acronym} - ${faculty.name}`
                      : faculty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Courses Selection */}
          <div>
            <Label htmlFor="courses">Completed Courses *</Label>
            <MultiSelect
              options={
                Array.isArray(courses)
                  ? courses.map((course) => ({
                      label: `${course.acronym} - ${course.name}`,
                      value: course.id,
                    }))
                  : []
              }
              onValueChange={setSelectedCourseIds}
              value={selectedCourseIds}
              placeholder={
                !selectedFaculty
                  ? "Select faculty first"
                  : isLoadingCourses
                  ? "Loading courses..."
                  : "Select completed courses"
              }
              variant="inverted"
              maxCount={4}
              disabled={
                !selectedFaculty || isLoadingCourses || !Array.isArray(courses)
              }
              allowSelectAll={false}
            />
          </div>

          {coursesWithYears.length > 0 && (
            <div>
              <Label>Completion Year *</Label>
              <div className="space-y-2 mt-1.5">
                {coursesWithYears.map((course) => (
                  <div key={course.id} className="flex items-center gap-4">
                    <span
                      className="text-sm truncate flex-1"
                      title={course.name}
                    >
                      {course.name}
                    </span>
                    <Select
                      value={course.conclusionYear}
                      onValueChange={(value) =>
                        handleYearChange(course.id, value)
                      }
                      required
                    >
                      <SelectTrigger
                        id={`year-${course.id}`}
                        className="w-24 shrink-0"
                      >
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
            </div>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full"
              disabled={!isFormValid() || isPending}
              onClick={handleSubmit}
            >
              {isPending ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ManualSubmissionForm;
