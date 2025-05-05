"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { useToast } from "@/hooks/misc/useToast";
import { useListFaculties } from "@/hooks/faculty/useListFaculties";
import { useAddFaculty } from "@/hooks/faculty/useAddFaculty";
import { useAddCourse } from "@/hooks/courses/useAddCourse";
import { useListCourses } from "@/hooks/courses/useListCourses";
import { ArrowLeft, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Faculty,
  CourseExtended,
  CreateCourseDtoCourseTypeEnum,
  CreateCourseDtoStatusEnum,
} from "@/sdk";
import { useAuth } from "@/contexts/AuthContext";
import FacultyTable from "@/components/admin/facultyTable";
import CourseTable from "@/components/admin/courseTable";

export default function FacultyAndCourseManagement() {
  const { user } = useAuth();

  const router = useRouter();
  const { toast } = useToast();
  const {
    data: faculties,
    isLoading: isLoadingFaculties,
    refetch: refetchFaculties,
  } = useListFaculties();
  const addFacultyMutation = useAddFaculty();
  const addCourseMutation = useAddCourse();

  // State for Faculty Form
  const [facultyName, setFacultyName] = useState("");
  const [facultyNameInt, setFacultyNameInt] = useState("");
  const [facultyAcronym, setFacultyAcronym] = useState("");
  const [showFacultyForm, setShowFacultyForm] = useState(false);

  // State for Course Form
  const [courseName, setCourseName] = useState("");
  const [courseAcronym, setCourseAcronym] = useState("");
  const [courseInternationalName, setCourseInternationalName] = useState("");
  const [startYear, setStartYear] = useState<number>(new Date().getFullYear());
  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [courseType, setCourseType] = useState<CreateCourseDtoCourseTypeEnum>(
    CreateCourseDtoCourseTypeEnum.Bachelors
  );
  const [status, setStatus] = useState<CreateCourseDtoStatusEnum>(
    CreateCourseDtoStatusEnum.Active
  );
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [filterFacultyId, setFilterFacultyId] = useState<string>("all");

  const {
    data: courses,
    isLoading: isLoadingCourses,
    refetch: refetchCourses,
  } = useListCourses({
    facultyIds:
      filterFacultyId && filterFacultyId !== "all"
        ? [filterFacultyId]
        : undefined,
  });

  // Tab state
  const [activeTab, setActiveTab] = useState<"faculty" | "courses">("faculty");

  const handleAddFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addFacultyMutation.mutateAsync({
        addFacultyDto: {
          name: facultyName,
          nameInt: facultyNameInt,
          acronym: facultyAcronym,
          createdBy: user?.id,
        },
      });
      toast({
        title: "Success",
        description: "Faculty added successfully",
        variant: "success",
      });
      setFacultyName("");
      setFacultyNameInt("");
      setFacultyAcronym("");
      setShowFacultyForm(false);
      refetchFaculties();
    } catch (err) {
      console.error("Error adding faculty:", err);
      toast({
        title: "Error",
        description: "Failed to add faculty",
        variant: "destructive",
      });
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addCourseMutation.mutateAsync({
        createCourseDto: {
          name: courseName,
          acronym: courseAcronym,
          nameInt: courseInternationalName,
          startYear,
          facultyId: selectedFacultyId,
          courseType,
          status,
          createdBy: user?.id,
        },
      });
      toast({
        title: "Success",
        description: "Course added successfully",
        variant: "success",
      });
      setCourseName("");
      setCourseAcronym("");
      setCourseInternationalName("");
      setStartYear(new Date().getFullYear());
      setSelectedFacultyId("");
      setCourseType(CreateCourseDtoCourseTypeEnum.Bachelors);
      setStatus(CreateCourseDtoStatusEnum.Active);
      setShowCourseForm(false);
      refetchCourses();
    } catch (err) {
      console.error("Error adding course:", err);
      toast({
        title: "Error",
        description: "Failed to add course",
        variant: "destructive",
      });
    }
  };

  const courseTypes = [
    { value: CreateCourseDtoCourseTypeEnum.Bachelors, label: "BACHELORS" },
    { value: CreateCourseDtoCourseTypeEnum.Masters, label: "MASTERS" },
    { value: CreateCourseDtoCourseTypeEnum.Doctorate, label: "DOCTORATE" },
    {
      value: CreateCourseDtoCourseTypeEnum.IntegratedMasters,
      label: "INTEGRATED MASTERS",
    },
  ];

  const statusTypes = [
    { value: CreateCourseDtoStatusEnum.Active, label: "ACTIVE" },
    { value: CreateCourseDtoStatusEnum.Inactive, label: "INACTIVE" },
  ];

  return (
    <div className="container mx-auto py-10 min-h-screen bg-white">
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          size="default"
          className="hover:bg-gray-100 transition-colors duration-200 text-muted-foreground hover:text-foreground"
          onClick={() => router.push("/admin")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-[#8C2D19]">
          Faculty & Course Management
        </h1>
      </div>

      {/* Tabs */}
      <div className="mb-4">
        <div className="flex space-x-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("faculty")}
            className={`py-2 px-4 font-medium transition-all duration-200 ${
              activeTab === "faculty" 
                ? "border-b-2 border-[#8C2D19] text-[#8C2D19]" 
                : "text-gray-500 hover:text-[#A13A23]"
            }`}
          >
            Faculties
          </button>
          <button
            onClick={() => setActiveTab("courses")}
            className={`py-2 px-4 font-medium transition-all duration-200 ${
              activeTab === "courses" 
                ? "border-b-2 border-[#8C2D19] text-[#8C2D19]" 
                : "text-gray-500 hover:text-[#A13A23]"
            }`}
          >
            Courses
          </button>
        </div>
      </div>

      {/* Faculty Tab Content */}
      {activeTab === "faculty" && (
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowFacultyForm(!showFacultyForm)}
                className="bg-white border border-[#8C2D19] text-[#8C2D19] hover:bg-[#A13A23] hover:text-white transition-colors duration-200"
              >
                <Plus className="h-4 w-4 mr-1" /> Add New Faculty
              </Button>
            </div>
          </div>

          {showFacultyForm && (
            <Card className="mb-4 shadow-lg border border-gray-200 rounded-lg">
              <CardHeader className="py-4">
                <CardTitle className="text-xl text-[#8C2D19]">
                  Add New Faculty
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddFaculty} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label
                        htmlFor="facultyName"
                        className="text-[#8C2D19] font-medium"
                      >
                        Faculty Name
                      </Label>
                      <Input
                        id="facultyName"
                        value={facultyName}
                        onChange={(e) => setFacultyName(e.target.value)}
                        placeholder="Faculty of Science"
                        required
                        className="mt-1 border-gray-300 focus:border-[#A13A23] focus:ring focus:ring-[#A13A23]/20 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="facultyNameInt"
                        className="text-[#8C2D19] font-medium"
                      >
                        International Name
                      </Label>
                      <Input
                        id="facultyNameInt"
                        value={facultyNameInt}
                        onChange={(e) => setFacultyNameInt(e.target.value)}
                        placeholder="Faculty of Science"
                        required
                        className="mt-1 border-gray-300 focus:border-[#A13A23] focus:ring focus:ring-[#A13A23]/20 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="facultyAcronym"
                        className="text-[#8C2D19] font-medium"
                      >
                        Acronym
                      </Label>
                      <Input
                        id="facultyAcronym"
                        value={facultyAcronym}
                        onChange={(e) => setFacultyAcronym(e.target.value)}
                        placeholder="FCT"
                        required
                        className="mt-1 border-gray-300 focus:border-[#A13A23] focus:ring focus:ring-[#A13A23]/20 transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div className="flex justify-start space-x-4 mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowFacultyForm(false)}
                      className="border-[#8C2D19] text-[#8C2D19] hover:bg-[#A13A23] hover:text-white transition-colors duration-200"
                    >
                      Cancel
                    </Button>
                    <LoadingButton
                      type="submit"
                      isLoading={addFacultyMutation.isPending}
                      disabled={
                        !facultyName || !facultyNameInt || !facultyAcronym
                      }
                      className="bg-[#8C2D19] hover:bg-[#A13A23] text-white transition-colors duration-200"
                    >
                      Add Faculty
                    </LoadingButton>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <FacultyTable
            faculties={faculties}
            isLoadingFaculties={isLoadingFaculties}
          />
        </>
      )}

      {/* Courses Tab Content */}
      {activeTab === "courses" && (
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowCourseForm(!showCourseForm)}
                className="bg-white border border-[#8C2D19] text-[#8C2D19] hover:bg-[#A13A23] hover:text-white transition-colors duration-200"
              >
                <Plus className="h-4 w-4 mr-1" /> Add New Course
              </Button>
            </div>
          </div>

          {showCourseForm && (
            <Card className="mb-4 shadow-lg border border-gray-200 rounded-lg">
              <CardHeader className="py-4">
                <CardTitle className="text-xl text-[#8C2D19]">
                  Add New Course
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddCourse} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-y-2 gap-x-4">
                    <div>
                      <Label
                        htmlFor="faculty"
                        className="text-[#8C2D19] font-medium"
                      >
                        Faculty
                      </Label>
                      <Select
                        value={selectedFacultyId}
                        onValueChange={setSelectedFacultyId}
                        disabled={isLoadingFaculties || !faculties}
                      >
                        <SelectTrigger className="mt-1 border-gray-300 focus:border-[#A13A23] focus:ring focus:ring-[#A13A23]/20 transition-all duration-200">
                          <SelectValue placeholder="Select a faculty" />
                        </SelectTrigger>
                        <SelectContent>
                          {faculties?.map((faculty: Faculty) => (
                            <SelectItem key={faculty.id} value={faculty.id}>
                              {faculty.acronym} - {faculty.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label
                        htmlFor="courseName"
                        className="text-[#8C2D19] font-medium"
                      >
                        Course Name
                      </Label>
                      <Input
                        id="courseName"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                        placeholder="Computer Science"
                        required
                        className="mt-1 border-gray-300 focus:border-[#A13A23] focus:ring focus:ring-[#A13A23]/20 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="courseInternationalName"
                        className="text-[#8C2D19] font-medium"
                      >
                        International Name
                      </Label>
                      <Input
                        id="courseInternationalName"
                        value={courseInternationalName}
                        onChange={(e) =>
                          setCourseInternationalName(e.target.value)
                        }
                        placeholder="Computer Science"
                        className="mt-1 border-gray-300 focus:border-[#A13A23] focus:ring focus:ring-[#A13A23]/20 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="courseAcronym"
                        className="text-[#8C2D19] font-medium"
                      >
                        Acronym
                      </Label>
                      <Input
                        id="courseAcronym"
                        value={courseAcronym}
                        onChange={(e) => setCourseAcronym(e.target.value)}
                        placeholder="CS"
                        required
                        className="mt-1 border-gray-300 focus:border-[#A13A23] focus:ring focus:ring-[#A13A23]/20 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="courseType"
                        className="text-[#8C2D19] font-medium"
                      >
                        Course Type
                      </Label>
                      <Select
                        value={courseType}
                        onValueChange={(value) =>
                          setCourseType(value as CreateCourseDtoCourseTypeEnum)
                        }
                      >
                        <SelectTrigger className="mt-1 border-gray-300 focus:border-[#A13A23] focus:ring focus:ring-[#A13A23]/20 transition-all duration-200">
                          <SelectValue placeholder="Select a course type" />
                        </SelectTrigger>
                        <SelectContent>
                          {courseTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label
                        htmlFor="status"
                        className="text-[#8C2D19] font-medium"
                      >
                        Status
                      </Label>
                      <Select
                        value={status}
                        onValueChange={(value) =>
                          setStatus(value as CreateCourseDtoStatusEnum)
                        }
                      >
                        <SelectTrigger className="mt-1 border-gray-300 focus:border-[#A13A23] focus:ring focus:ring-[#A13A23]/20 transition-all duration-200">
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label
                        htmlFor="startYear"
                        className="text-[#8C2D19] font-medium"
                      >
                        Start Year
                      </Label>
                      <Input
                        id="startYear"
                        type="number"
                        value={startYear}
                        onChange={(e) => setStartYear(parseInt(e.target.value))}
                        required
                        className="mt-1 border-gray-300 focus:border-[#A13A23] focus:ring focus:ring-[#A13A23]/20 transition-all duration-200"
                        min={1950}
                        max={new Date().getFullYear()}
                      />
                    </div>
                    {status === CreateCourseDtoStatusEnum.Inactive && (
                      <div>
                        <Label
                          htmlFor="endYear"
                        className="text-[#8C2D19] font-medium"
                      >
                        Start Year
                      </Label>
                      <Input
                        id="startYear"
                        type="number"
                        value={startYear}
                        onChange={(e) => setStartYear(parseInt(e.target.value))}
                        required
                        className="mt-1 border-gray-300 focus:border-[#A13A23] focus:ring focus:ring-[#A13A23]/20 transition-all duration-200"
                        min={1950}
                        max={new Date().getFullYear()}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex justify-start space-x-3 mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCourseForm(false)}
                      className="border-[#8C2D19] text-[#8C2D19] hover:bg-[#A13A23] hover:text-white transition-colors duration-200"
                    >
                      Cancel
                    </Button>
                    <LoadingButton
                      type="submit"
                      isLoading={addCourseMutation.isPending}
                      disabled={
                        !courseName ||
                        !courseAcronym ||
                        !selectedFacultyId ||
                        !startYear
                      }
                      className="bg-[#8C2D19] hover:bg-[#A13A23] text-white transition-colors duration-200"
                    >
                      Add Course
                    </LoadingButton>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <CourseTable
            courses={courses}
            isLoadingCourses={isLoadingCourses}
            filterFacultyId={filterFacultyId}
            setFilterFacultyId={setFilterFacultyId}
            faculties={faculties}
          />
        </>
      )}
    </div>
  );
}
