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
          <Card className="mb-4 bg-transparent border-none shadow-none">
            <CardContent className="pt-2 pb-2 bg-transparent">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 items-stretch mb-2">
                <div className="space-y-4">
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
                          ? ` to ${new Date(
                              focusedRole?.endDate
                            ).toLocaleDateString("en-US", {
                              month: "long",
                              year: "numeric",
                            })}`
                          : " - Present"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg border border-gray-200 mt-auto">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <TagIcon className="h-4 w-4 text-primary" />
                        <span>ESCO:</span>
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
                        </Link>
                        <ArrowUpRight className="w-3 h-3 text-primary" />
                      </div>
                      <Badge variant="secondary" className="text-xs font-mono">
                        {focusedRole?.jobClassification?.escoClassification
                          ?.code || "N/A"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Company Section */}
                <div className="space-y-4">
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
                              : focusedRole.company.location.country ||
                                "Unknown"}
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
                        <Button
                          title="Visit Website"
                          variant="outline"
                          className="gap-2 hover:bg-blue-50 hover:border-blue-200 transition-all"
                          onClick={() => {
                            window.open(focusedRole.company.website, "_blank");
                          }}
                        >
                          <Globe className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          Website
                        </Button>
                      )}
                      {focusedRole?.company?.linkedinUrl && (
                        <Button
                          title="Visit LinkedIn"
                          variant="outline"
                          className="gap-2 hover:bg-blue-50 hover:border-blue-200 transition-all"
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
                          LinkedIn
                        </Button>
                      )}
                      {!focusedRole?.company?.website &&
                        !focusedRole?.company?.linkedinUrl && (
                          <p className="text-sm text-gray-500 italic">
                            No company links available
                          </p>
                        )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-3">
                      <MapPin className="h-5 w-5 text-green-600" />
                      <span className="text-xl font-bold text-gray-800">
                        {focusedRole?.location?.city &&
                        focusedRole?.location?.country
                          ? `${focusedRole.location.city}, ${focusedRole.location.country}`
                          : "Location not specified"}
                      </span>
                      {focusedRole?.location?.countryCode && (
                        <Image
                          src={`https://flagcdn.com/${focusedRole.location.countryCode.toLowerCase()}.svg`}
                          alt={focusedRole.location.country || ""}
                          className="w-8 h-5 rounded shadow-sm"
                          width={32}
                          height={20}
                        />
                      )}
                    </div>

                    {/* Spacer to push button to bottom */}
                    <div className="flex-1"></div>

                    {/* View in Map button */}
                    {focusedRole?.location &&
                      buildMapUrl(focusedRole.location) && (
                        <Button
                          variant="outline"
                          className="gap-2 hover:bg-green-50/80 hover:border-green-200 mt-4 transition-all"
                          onClick={() => {
                            const mapUrl = buildMapUrl(focusedRole.location!);
                            if (mapUrl) {
                              window.open(mapUrl, "_blank");
                            }
                          }}
                        >
                          <MapPin className="h-4 w-4" />
                          View in Map
                        </Button>
                      )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
                      <Button
                        className="w-full bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
                        size="lg"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Request Profile Update
                      </Button>
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
                      <Button
                        variant="destructive"
                        className="w-full shadow-md hover:shadow-lg transition-all"
                        size="lg"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Request Account Deletion
                      </Button>
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
