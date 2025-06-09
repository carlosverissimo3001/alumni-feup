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
import { CourseAnalyticsEntity as Course } from "@/sdk";
import { Button } from "@/components/ui/button";
import { useVerifyEmail, useVerifyEmailToken } from "@/hooks/auth/useAuth";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type CourseWithYear = Course & {
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
  const [otpCode, setOtpCode] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [selectedFaculty, setSelectedFaculty] = useState<string | undefined>(
    undefined
  );
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [coursesWithYears, setCoursesWithYears] = useState<CourseWithYear[]>(
    []
  );

  const { data: faculties, isLoading: isLoadingFaculties } = useListFaculties();
  const { data: courses, isLoading: isLoadingCourses } = useListCourses({
    params: {
      facultyIds: selectedFaculty ? [selectedFaculty] : undefined,
    },
    enabled: !!selectedFaculty,
  });

  const { mutate: sendVerificationEmail, isPending: isSendingEmail,} = useVerifyEmail({
    data: { verifyEmailDto: { email: personalEmail } },
    onSuccess: () => {
      toast({
        title: "Verification code sent!",
        description: "Please check your email for the verification code.",
        variant: "success",
      });
      setResendCooldown(60); 
    },
    onError: () => {
      toast({
        title: "Failed to send verification code",
        description: "Please try again later",
        variant: "destructive",
      });
    },
  });

  const { mutate: verifyEmailToken, isPending: isVerifyingToken } = useVerifyEmailToken({
    data: { verifyEmailTokenDto: { token: otpCode, email: personalEmail } },
    onSuccess: () => {
      setIsEmailVerified(true);
      toast({
        title: "Success!",
        description: "Email verified successfully!",
        variant: "success",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Invalid verification code. Please try again.",
        variant: "destructive",
      });
    },
  });


  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown(prevCooldown => prevCooldown - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [resendCooldown]);

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
  }, [selectedCourseIds, courses, coursesWithYears]);

  const handleYearChange = (courseId: string, year: string) => {
    setCoursesWithYears((prev) =>
      prev.map((course) =>
        course.id === courseId ? { ...course, conclusionYear: year } : course
      )
    );
  };

  const getAvailableYears = (course: CourseWithYear) => {
    const currentYear = new Date().getFullYear();
    const startYear = typeof course.startYear === 'number' && course.startYear > 1900
      ? course.startYear
      : currentYear - 10;
    const endYear = typeof course.endYear === 'number' ? course.endYear : currentYear;
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

  const isFormValid = () => {
    return (
      isEmailVerified &&
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
              {/* Email Verification Section */}
              <div className="space-y-4 bg-gradient-to-b from-gray-50 to-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Email Verification</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-gray-600">Please verify your email to continue</p>
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild onClick={(e) => e.preventDefault()}>
                            <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
                              <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>We verify emails to ensure legitimate submissions and maintain the quality of our alumni network.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  {isEmailVerified && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Verified
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="personalEmail" className="text-sm font-medium flex items-center gap-2">
                      Email Address <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="personalEmail"
                        value={personalEmail}
                        onChange={(e) => setPersonalEmail(e.target.value)}
                        placeholder="your@email.com"
                        type="email"
                        disabled={isEmailVerified}
                        className={`transition-all duration-200 ${isEmailVerified ? 'bg-gray-50 text-gray-500' : ''}`}
                        required
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => sendVerificationEmail()}
                        disabled={isEmailVerified || isSendingEmail || resendCooldown > 0}
                        className={`min-w-[100px] transition-all duration-200 ${
                          isEmailVerified || resendCooldown > 0
                            ? 'opacity-50 cursor-not-allowed' 
                            : ''
                        }`}
                      >
                        {isSendingEmail ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-transparent"></div>
                            <span>Sending...</span>
                          </div>
                        ) : resendCooldown > 0 ? (
                          <div className="flex items-center gap-1">
                            <span>Wait {resendCooldown}s</span>
                          </div>
                        ) : (
                          'Send Code'
                        )}
                      </Button>
                    </div>
                  </div>

                  {personalEmail && !isEmailVerified && (
                    <div className="animate-in fade-in slide-in-from-top duration-300">
                      <Label htmlFor="otpCode" className="text-sm font-medium">
                        Verification Code <span className="text-destructive">*</span>
                      </Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          id="otpCode"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                          className="font-mono tracking-wider text-center"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => verifyEmailToken()}
                          disabled={otpCode.length < 6 || isVerifyingToken}
                          className="min-w-[100px]"
                        >
                          {isVerifyingToken ? (
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-transparent"></div>
                              <span>Verifying...</span>
                            </div>
                          ) : (
                            'Verify'
                          )}
                        </Button>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Didn&apos;t receive the code?{" "}
                        {resendCooldown > 0 ? (
                          <span className="text-gray-400">
                            Resend in {resendCooldown}s
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => sendVerificationEmail()}
                            disabled={isSendingEmail || resendCooldown > 0}
                            className="text-primary hover:underline disabled:opacity-50"
                          >
                            Send again
                          </button>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Rest of the form - only show if email is verified */}
              {isEmailVerified && (
                <>
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
                          Completed Degrees <span className="text-destructive">*</span>
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
                            placeholder="Select your degrees"
                            disabled={!selectedFaculty || isLoadingCourses}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {coursesWithYears.length > 0 && (
                    <div className="space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div>
                        <h3 className="font-medium text-gray-900">Degree(s) Completion</h3>
                        <p className="text-sm text-gray-500">Select the year you completed each degree</p>
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
                </>
              )}
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManualSubmissionForm;
