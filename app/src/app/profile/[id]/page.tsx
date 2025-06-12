"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "next/navigation";
import { useFetchProfile } from "@/hooks/profile/useFetchProfile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  Globe,
  ArrowUpRight,
  MapPin,
  Clock,
  RefreshCw,
  Trash2,
  TagIcon,
  Factory,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { mapSeniorityLevel } from "@/utils/mappings";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import CareerTimeline from "@/components/profile/CareerTimeline";
import { LocationAnalyticsEntity, RoleAnalyticsEntity } from "@/sdk";
import { motion } from "framer-motion";
import { SENIORITY_COLORS } from "@/consts";
import clsx from "clsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDeleteProfile } from "@/hooks/profile/useDeleteProfile";
import { useRequestDataUpdate } from "@/hooks/profile/useRequestDataUpdate";
import { toast } from "@/hooks/misc/useToast";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";

export default function Profile() {
  const { id } = useParams();
  const {
    data: profile,
    isLoading,
    error,
  } = useFetchProfile({ id: id as string });
  const { user } = useAuth();

  let focusedRole: RoleAnalyticsEntity | undefined;

  // Get current roles
  const currentRoles = profile?.roles?.filter((role) => role.isCurrent);

  const isRequestingDataUpdateEnabled = false;

  if (currentRoles && currentRoles.length === 1) {
    // Case 1: Single current role
    focusedRole = currentRoles[0];
  } else if (currentRoles && currentRoles.length > 1) {
    // Case 2: Multiple current roles - use the one that started first
    focusedRole = [...currentRoles].sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    )[0];
  } else if (profile?.roles && profile.roles.length > 0) {
    // Case 3: No current roles - use the most recent role (last to start)
    focusedRole = [...profile.roles].sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    )[0];
  }

  const buildMapUrl = (
    location: LocationAnalyticsEntity
  ): string | undefined => {
    if (!location.latitude || !location.longitude) {
      return undefined;
    }
    return `/?lat=${location.latitude}&lng=${location.longitude}&group_by=cities`;
  };

  // Hooks
  const { mutate: requestDataUpdate, isPending: isRequestingDataUpdate } =
    useRequestDataUpdate({
      onSuccess: () => {
        toast({
          title: "Profile update requested",
          variant: "success",
          description: "Your profile update has been requested",
          duration: 2000,
        });
      },
    });
  const { mutate: deleteProfile, isPending: isDeletingProfile } =
    useDeleteProfile({
      onSuccess: () => {
        toast({
          title: "Profile deleted",
          variant: "success",
          description: "Your profile has been deleted",
          duration: 5000,
        });
      },
    });
  const handleRequestDataUpdate = () => {
    requestDataUpdate(id as string);
  };
  const handleDeleteProfile = () => {
    deleteProfile(id as string);
  };

  if (isLoading) {
    return <ProfileSkeleton id={id as string} />;
  }

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

  // Get the job title from the role raw if available, otherwise from the job classification
  const jobTitle =
    focusedRole?.roleRaw?.title ??
    focusedRole?.jobClassification?.escoClassification.titleEn;

  return (
    <div className="min-h-screen ">
      <div className="max-w-screen-xl mx-auto py-12 px-4">
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Avatar className="h-24 w-24 border-2 border-primary shadow-lg hover:shadow-xl transition-shadow duration-300 hover:scale-105 transform">
              <AvatarImage
                src={profile?.profilePictureUrl}
                alt="Profile"
                className="object-cover"
              />
              <AvatarFallback className="text-xl font-semibold bg-gradient-to-br from-primary/20 to-primary/10">
                {profile?.fullName
                  ?.split(" ")
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold flex items-center bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
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
                    className="hover:opacity-80 transition-opacity"
                  />
                </Link>
              )}
            </h2>
            {profile?.graduations && profile.graduations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-sm text-muted-foreground mt-2 space-y-1"
              >
                <span className="text-primary/80 mr-2">Graduated from</span>
                {profile.graduations.map((graduation, index) => (
                  <div
                    key={index}
                    className="font-medium bg-primary/5 px-3 py-1 rounded-full inline-block mr-2"
                  >
                    {graduation.course.acronym} ({graduation.conclusionYear}) @
                    <span className="font-semibold text-primary ml-1">
                      {graduation.course.faculty.acronym}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 items-stretch mb-8">
            {/* Role Card */}
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 flex flex-col h-full">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {jobTitle || "No role specified"}
              </h3>
              {focusedRole?.seniorityLevel && (
                <>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <span
                      className={clsx(
                        "px-2 py-0.5 ml-[-3px] rounded-full border text-xs font-medium",
                        SENIORITY_COLORS[focusedRole.seniorityLevel] ||
                          "bg-gray-100 text-gray-800 border-gray-200"
                      )}
                    >
                      {mapSeniorityLevel(focusedRole.seniorityLevel)}
                    </span>
                  </div>
                </>
              )}
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <Clock className="h-4 w-4 mr-3 text-primary" />
                <span>
                  {focusedRole?.startDate
                    ? new Date(focusedRole?.startDate).toLocaleDateString(
                        "en-US",
                        { month: "long", year: "numeric" }
                      )
                    : ""}
                  {focusedRole?.endDate
                    ? ` to ${new Date(focusedRole?.endDate).toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          year: "numeric",
                        }
                      )}`
                    : " - Present"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg border border-gray-200 mt-auto">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <TagIcon className="h-4 w-4 text-primary" />
                  <span>ESCO:</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={
                            focusedRole?.jobClassification?.escoClassification
                              .escoUrl || "#"
                          }
                          className="font-medium hover:text-primary transition-colors underline"
                          target="_blank"
                        >
                          {
                            focusedRole?.jobClassification?.escoClassification
                              .titleEn
                          }
                          <span className="sr-only">
                            View ESCO classification details
                          </span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        View ESCO classification details
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <ArrowUpRight className="w-3 h-3 text-primary" />
                </div>
                <Badge variant="secondary" className="text-xs font-mono">
                  {focusedRole?.jobClassification?.escoClassification?.code ||
                    "N/A"}
                </Badge>
              </div>
            </div>

            {/* Company Card */}
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex flex-col h-full">
              <div className="flex items-center gap-3">
                {focusedRole?.company?.logo && (
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Image
                      src={focusedRole.company.logo}
                      alt={focusedRole.company.name || ""}
                      className="w-8 h-8 object-contain"
                      width={32}
                      height={32}
                    />
                  </div>
                )}
                <Link
                  href={`/company/${focusedRole?.company?.id}`}
                  className="text-xl font-bold text-gray-800 hover:text-primary transition-colors group flex items-center gap-2"
                >
                  {focusedRole?.company?.name || "No company specified"}
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>

              {(focusedRole?.company?.location ||
                focusedRole?.company?.industry) && (
                <div className="flex flex-col gap-1 my-3 ml-1">
                  {focusedRole?.company?.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      {focusedRole.company.location.city &&
                      focusedRole.company.location.country
                        ? `${focusedRole.company.location.city}, ${focusedRole.company.location.countryCode}`
                        : focusedRole.company.location.country || "Unknown"}
                      {focusedRole.company.location.countryCode && (
                        <Image
                          src={`https://flagcdn.com/${focusedRole.company.location.countryCode.toLowerCase()}.svg`}
                          alt={focusedRole.company.location.country || ""}
                          className="w-6 h-4 rounded shadow-sm"
                          width={24}
                          height={16}
                        />
                      )}
                    </div>
                  )}
                  {focusedRole?.company?.industry && (
                    <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                      <Factory className="h-4 w-4 text-blue-600" />
                      {focusedRole.company.industry.name}
                    </div>
                  )}
                </div>
              )}

              <div className="flex-1"></div>

              <div className="flex flex-row gap-12 justify-center">
                {focusedRole?.company?.website && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-2 hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer"
                          onClick={() => {
                            window.open(focusedRole.company.website, "_blank");
                          }}
                        >
                          <Globe className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          <span>Website</span>
                          <span className="sr-only">Visit Website</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        Visit the company&apos;s website
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {focusedRole?.company?.linkedinUrl && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-2 hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer"
                          onClick={() => {
                            window.open(
                              focusedRole.company.linkedinUrl,
                              "_blank"
                            );
                          }}
                        >
                          <Image
                            src="/logos/linkedin-icon.svg"
                            alt="LinkedIn"
                            width={20}
                            height={20}
                            className="hover:opacity-80 transition-opacity"
                          />
                          <span>LinkedIn</span>
                          <span className="sr-only">
                            Visit LinkedIn Profile
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        Visit the company&apos;s LinkedIn profile
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {!focusedRole?.company?.website &&
                  !focusedRole?.company?.linkedinUrl && (
                    <p className="text-sm text-gray-500 italic">
                      No company links available
                    </p>
                  )}
              </div>
            </div>

            {/* Location Card */}
            <div className="space-y-4">
              <div className="p-6 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span className="text-xl font-bold text-gray-800">
                    {profile?.location?.city && profile?.location?.country
                      ? `${profile.location.city}, ${profile.location.country}`
                      : "Location not specified"}
                  </span>
                  {profile?.location?.countryCode && (
                    <Image
                      src={`https://flagcdn.com/${profile.location.countryCode.toLowerCase()}.svg`}
                      alt={profile.location.country || ""}
                      className="w-8 h-5 rounded shadow-sm"
                      width={32}
                      height={20}
                    />
                  )}
                </div>

                <div className="flex-1"></div>

                {focusedRole?.location && buildMapUrl(focusedRole.location) && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div
                          className="inline-flex w-1/2 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 gap-2 cursor-pointer"
                          onClick={() => {
                            const mapUrl = buildMapUrl(focusedRole.location!);
                            if (mapUrl) {
                              window.open(mapUrl, "_blank");
                            }
                          }}
                        >
                          <MapPin className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                          <span>View in Map</span>
                          <span className="sr-only">
                            View location in interactive map
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        View this location in the interactive map
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Role History Section */}
        {profile?.roles && profile.roles.length > 1 && (
          <CareerTimeline roles={profile.roles} />
        )}

        {user?.id === profile?.id && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              Profile Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-stretch">
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
                className="flex"
              >
                <Card className="flex flex-col w-full shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:bg-white">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center text-gray-800">
                      <div className="p-2 rounded-lg bg-primary/10 mr-3">
                        <RefreshCw className="h-5 w-5 text-primary" />
                      </div>
                      Request Profile Update
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1">
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      If you have recently updated your LinkedIn profile, you
                      can request an update to this profile.
                    </p>
                    <div className="mt-auto">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            className="w-full bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
                            size="lg"
                            disabled={!isRequestingDataUpdateEnabled}
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Request Profile Update
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Request Profile Update
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will request an update of your profile data
                              from LinkedIn. The update process may take a few
                              minutes to complete.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleRequestDataUpdate}
                              className="bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                              {isRequestingDataUpdate
                                ? "Requesting..."
                                : "Confirm Update"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
                className="flex"
              >
                <Card className="flex flex-col w-full shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:bg-white">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center text-gray-800">
                      <div className="p-2 rounded-lg bg-destructive/10 mr-3">
                        <Trash2 className="h-5 w-5 text-destructive" />
                      </div>
                      Request Account Deletion
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1">
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      If you want to delete your account, you can request it
                      here. We will delete your account and all your data from
                      our database.
                    </p>
                    <div className="mt-auto">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            className="w-full shadow-md hover:shadow-lg transition-all"
                            size="lg"
                            disabled={isDeletingProfile}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Request Account Deletion
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete your account and remove all
                              your data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteProfile}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {isDeletingProfile
                                ? "Deleting..."
                                : "Delete Account"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
