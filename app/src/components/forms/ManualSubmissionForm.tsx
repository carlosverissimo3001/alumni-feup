"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/loading-button";
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
import { CreateAlumniDto } from "@/sdk/api";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { CourseExtended as Course } from "@/sdk";
import { Button } from "@/components/ui/button";
import { Divide } from "lucide-react";

interface CourseWithYear extends Course {
  conclusionYear: string;
}

interface ManualSubmissionFormProps {
  onBack: () => void;
}

const ManualSubmissionForm = ({ onBack }: ManualSubmissionFormProps) => {
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

  const onSuccess = () => {
    toast({
      title: "Success!",
      description: `Your submission has been received. Welcome ${fullName.split(" ")[0]}!!`,
      duration: 3000,
      variant: "success",
    });
    setTimeout(() => {
      router.push('/');
    }, 1000);
  }

  const dto: CreateAlumniDto = {
    fullName,
    linkedinUrl: linkedInUrl,
    personalEmail: personalEmail || undefined,
    // Note: This will be defined before submission
    facultyId: selectedFaculty!,
    courses: coursesWithYears.map((course) => ({
      courseId: course.id,
      conclusionYear: parseInt(course.conclusionYear),
    })),
  };

  const { mutate: sendManualSubmission, isPending, error } = useManualSubmission({
    data: dto,
    onSuccess,
  });


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
            ...course,
            name: `${course.acronym} - ${course.name}`,
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

    sendManualSubmission();
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <Card className="max-w-3xl mx-auto">
        <CardContent className="p-6">
          <div className="space-y-2">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={onBack}
                className="hover:bg-gray-100 -ml-2"
              >
                ← Back
              </Button>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">Join as Alumni</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-3 md:col-span-2">
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
                    <Label htmlFor="personalEmail" className="text-sm font-medium flex items-center gap-2">
                      Personal Email 
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Optional</span>
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
                </div>
                <div className="space-y-3 md:col-span-2">
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
                        onValueChange={setSelectedCourseIds}
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
                </div>
              </div>

              {coursesWithYears.length > 0 && (
                <div className="space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div>
                    <h3 className="font-medium text-gray-900">Course(s) Completion</h3>
                    <p className="text-sm text-gray-500">Select the year you completed each course</p>
                  </div>
                  
                  <div className="space-y-2">
                    {coursesWithYears.map((course) => (
                      <div key={course.id} className="flex items-center gap-4 p-2 rounded-lg bg-white border border-gray-200">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{course.name}</p>
                        </div>
                        <Select
                          value={course.conclusionYear}
                          onValueChange={(year) => handleYearChange(course.id, year)}
                        >
                          <SelectTrigger className="w-[100px]">
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

              {!!error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <LoadingButton
                type="submit"
                className="w-full py-6 text-lg font-medium mt-6"
                isLoading={isPending}
                disabled={!isFormValid()}
              >
                {isPending ? "Submitting..." : "Submit Application"}
              </LoadingButton>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManualSubmissionForm;
