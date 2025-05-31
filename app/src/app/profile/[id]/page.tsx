"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "next/navigation";
import { useFetchProfile } from "@/hooks/profile/useFetchProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  Globe,
  ArrowUpRight,
  MapPin,
  Briefcase,
  Clock,
  RefreshCw,
  Trash2,
  TagIcon,
  Gauge,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { mapSeniorityLevel } from "@/utils/mappings";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useListEscoClassifications } from "@/hooks/esco/useListEscoClassifications";
import { Combobox } from "@/components/ui/combobox";
import RoleHistory from "@/components/profile/RoleHistory";

export default function Profile() {
  const { id } = useParams();
  const {
    data: profile,
    isLoading,
    error,
  } = useFetchProfile({ id: id as string });

  const { user } = useAuth();

  const currentRoles = profile?.roles.filter(role => role.isCurrent);
  // If the alumni has more than one current role, we'll display the one that started first
  const currentRole = currentRoles?.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];

  // For placeholder purposes, simulate confidence if not provided
  const confidenceValue = currentRole?.jobClassification?.confidence || 0.65;

  // State for selected ESCO classifications
  const [selectedEsco, setSelectedEsco] = useState<string | null>(null);
  const [escoDialogOpen, setEscoDialogOpen] = useState(false);

  const { data } = useListEscoClassifications({
    level: 1,
    enabled: escoDialogOpen,
  });

  const escoOptions =
    data?.map((item) => ({
      label: item.title,
      value: item.escoCode,
    })) || [];

  const handleUpdateEsco = () => {
    // Here we will call the API to update the ESCO classification
    setEscoDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="flex items-center gap-6 mb-8">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-9 w-56" />
            <Skeleton className="h-5 w-40" />
          </div>
        </div>
        <Skeleton className="h-64 w-full mb-8 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <Alert variant="destructive" className="rounded-lg">
          <AlertCircle className="h-5 w-5 mr-2" />
          <AlertDescription className="text-base">
            Error loading profile: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Get the job title from the first job classification if available
  const jobTitle = currentRole?.jobClassification?.escoClassification.titleEn;

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10">
        <Avatar className="h-24 w-24 border-2 border-primary shadow-md">
          <AvatarImage
            src={profile?.profilePictureUrl}
            alt="Profile"
          />
          <AvatarFallback className="text-xl font-semibold bg-primary/10">
            {profile?.fullName
              ?.split(" ")
              .map((word) => word[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-3xl font-bold flex items-center">
            {profile?.fullName}
            {profile?.linkedinUrl && (
              <Link
                href={profile.linkedinUrl}
                target="_blank"
                className="ml-3 flex items-center text-primary hover:scale-110 transition-transform"
                title="View LinkedIn Profile"
              >
                <Image
                  src="/logos/linkedin-icon.svg"
                  alt="LinkedIn"
                  width={20}
                  height={20}
                />
              </Link>
            )}
          </h2>
          {profile?.graduations && profile.graduations.length > 0 && (
            <div className="text-sm text-muted-foreground mt-2">
              Graduated from
              {profile.graduations.map((graduation, index) => (
                <div key={index} className="font-semibold">
                  {graduation.course.acronym} ({graduation.conclusionYear}) @
                  {graduation.course.faculty.acronym}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Card className="mb-10 shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center">
            <Briefcase className="mr-2 h-5 w-5 text-primary" />
            Current Role
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-lg font-semibold">
                {jobTitle || "No role specified"}
              </div>
              {currentRole?.seniorityLevel && (
                <>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary/80 mr-2"></span>
                    {mapSeniorityLevel(currentRole?.seniorityLevel)}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                    {currentRole?.startDate
                      ? new Date(currentRole?.startDate).toLocaleDateString(
                          "en-US",
                          { month: "long", year: "numeric" }
                        )
                      : ""}
                    {currentRole?.endDate
                      ? ` to ${new Date(
                          currentRole?.endDate
                        ).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}`
                      : " - Present"}
                  </div>
                  <Link
                    href={currentRole?.jobClassification?.escoClassification.escoUrl || "#"}
                    className="text-xs hover:text-primary transition-colors group flex items-center gap-1 mt-2"
                    target="_blank"
                  >
                    In ESCO as{" "}
                    <span className="font-bold underline">
                      {currentRole?.jobClassification?.escoClassification.titleEn}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:text-primary transition-colors" />
                  </Link>
                </>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {currentRole?.company?.logo && (
                  <div className="bg-white p-1 rounded-md shadow-sm">
                    <Image
                      src={currentRole.company.logo}
                      alt={currentRole.company.name || ""}
                      className="w-7 h-7 object-contain"
                      width={28}
                      height={28}
                    />
                  </div>
                )}
                <Link
                  href={`/company/${currentRole?.company?.id}`}
                  className="text-lg font-semibold hover:text-primary transition-colors group flex items-center gap-1"
                >
                  {currentRole?.company?.name || "No company specified"}
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>
              {currentRole?.company?.industry && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <span className="inline-block w-2 h-2 rounded-full bg-zinc-400 mr-2"></span>
                  {currentRole.company.industry.name}
                </div>
              )}
              <div className="mt-3 flex flex-col gap-2">
                {currentRole?.company?.website && (
                  <Link
                    href={currentRole.company.website}
                    target="_blank"
                    className="flex items-center text-primary hover:text-primary/80 transition-color"
                    title="Visit Website"
                  >
                    <div className="flex items-center gap-1 text-sm">
                      <Globe className="w-4 h-4" />
                      Website
                    </div>
                  </Link>
                )}
                {currentRole?.company?.linkedinUrl && (
                  <Link
                    href={currentRole.company.linkedinUrl}
                    target="_blank"
                    className="flex items-center text-primary hover:text-primary/80 transition-colors"
                    title="View on LinkedIn"
                  >
                    <div className="flex items-center gap-1 text-sm">
                      <Image
                        src="/logos/linkedin-icon.svg"
                        alt="LinkedIn"
                        width={16}
                        height={16}
                      />
                      LinkedIn
                    </div>
                  </Link>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {currentRole?.location?.city && currentRole?.location?.country
                  ? `${currentRole.location.city}, ${currentRole.location.country}`
                  : "Location not specified"}
                {currentRole?.location?.countryCode && (
                  <Image
                    src={`https://flagcdn.com/${currentRole.location.countryCode.toLowerCase()}.svg`}
                    alt={currentRole.location.country || ""}
                    className="w-8 h-5 rounded shadow-sm ml-2"
                    width={32}
                    height={20}
                  />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role History Section */}
      {profile?.roles && profile.roles.length > 1 && (
        <RoleHistory
          roles={profile.roles.filter((role) => !role.isCurrent || role.id !== currentRole?.id)}
        />
      )}

      {user?.id === profile?.id && (
        <>
          {/* Actions the user accessing this page is the owner of the profile */}
          <h3 className="text-xl font-semibold mb-6">Profile Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <RefreshCw className="mr-2 h-5 w-5 text-primary" />
                  Request Profile Update
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-muted-foreground mb-4 flex-grow">
                  If you have recently updated your LinkedIn profile, you can
                  request an update to this profile. We update all profiles
                  automatically, every X days.
                </p>
                <div className="pt-4 mt-auto">
                  <Button className="w-full" size="lg">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Request Profile Update
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-destructive shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Trash2 className="mr-2 h-5 w-5 text-destructive" />
                  Request Account Deletion
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-muted-foreground mb-4 flex-grow">
                  If you want to delete your account, you can request it here.
                  We will delete your account and all your data from our
                  database.
                </p>
                <div className="pt-4 mt-auto">
                  <Button variant="destructive" className="w-full" size="lg">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Request Account Deletion
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <TagIcon className="mr-2 h-5 w-5 text-amber-500" />
                  Update ESCO Classification
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-muted-foreground mb-4 flex-grow">
                  Our AI might have incorrectly classified your role. You can
                  help us improve by updating your ESCO job classification.
                </p>
                <div className="pt-4 mt-auto">
                  <Dialog
                    open={escoDialogOpen}
                    onOpenChange={setEscoDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button className="w-full" size="lg" variant="outline">
                        <TagIcon className="mr-2 h-4 w-4" />
                        Update Job Classification
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                          <TagIcon className="h-5 w-5 text-amber-500" />
                          Update Your Job Classification
                        </DialogTitle>
                        <DialogDescription>
                          ESCO is the European multilingual classification of
                          Skills, Competences, Qualifications and Occupations.
                          Our AI has classified your role, but you can refine it
                          below.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Gauge className="h-4 w-4 text-amber-500" />
                              <p className="text-sm font-medium">
                                Current Classification
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <p className="font-semibold">
                              {currentRole?.jobClassification?.escoClassification.titleEn || "Unknown"}
                            </p>
                            <Badge
                              variant="outline"
                              className="bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200"
                            >
                              {currentRole?.jobClassification?.escoClassification?.code || "Not Classified"}
                            </Badge>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">Confidence</p>
                              <span className="text-xs font-medium">
                                {Math.round(confidenceValue as number * 100)}%
                              </span>
                            </div>
                            <Progress
                              value={confidenceValue * 100}
                              className="h-2"
                            />
                            <div className="flex justify-between text-xs mt-1">
                              <span
                                className={
                                  confidenceValue < 0.6
                                    ? "font-medium text-red-500"
                                    : "text-muted-foreground"
                                }
                              >
                                Low
                              </span>
                              <span
                                className={
                                  confidenceValue >= 0.6 &&
                                  confidenceValue <= 0.8
                                    ? "font-medium text-amber-500"
                                    : "text-muted-foreground"
                                }
                              >
                                Medium
                              </span>
                              <span
                                className={
                                  confidenceValue > 0.8
                                    ? "font-medium text-green-500"
                                    : "text-muted-foreground"
                                }
                              >
                                High
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Select the specific job classification that best
                            represents your role:
                          </p>
                          <Combobox
                            options={escoOptions}
                            value={selectedEsco}
                            onChange={setSelectedEsco}
                            placeholder="Select classification..."
                            searchPlaceholder="Search classifications..."
                            emptyMessage="No classifications found."
                            className="border-amber-200 focus-within:border-amber-500"
                            maxDisplayCount={30}
                            isLoading={!escoOptions.length && escoDialogOpen}
                          />
                        </div>
                      </div>

                      <DialogFooter>
                        <Button
                          variant="ghost"
                          onClick={() => setEscoDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="default"
                          className="bg-amber-500 hover:bg-amber-600 text-white"
                          onClick={handleUpdateEsco}
                          disabled={!selectedEsco}
                        >
                          Update Classification
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
