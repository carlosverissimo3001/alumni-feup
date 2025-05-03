"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "next/navigation";
import { useFetchBasicProfile } from "@/hooks/profile/useFetchBasicProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Globe, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { mapSeniorityLevel } from "@/utils/mappings";
const ESCO_BASE_URL = process.env.NEXT_PUBLIC_ESCO_BASE_URL;

export default function Profile() {
  const { id } = useParams();
  const {
    data: profile,
    isLoading,
    error,
  } = useFetchBasicProfile({id: id as string});

  const escoUrl = ESCO_BASE_URL ? ESCO_BASE_URL + profile?.role?.escoCode : '#';

  // Show loading state
  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="flex items-center gap-6 mb-8">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-40 w-full mb-8" />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Error loading profile: {error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Get the job title from the first job classification if available
  const jobTitle = profile?.role?.title;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      {/* Header */}
      <div className="flex items-center gap-6 mb-8">
        <Avatar className="h-20 w-20">
          <AvatarImage
            src={profile?.profilePictureUrl || "/placeholder-avatar.png"}
            alt="Profile"
          />
          <AvatarFallback>
            {profile?.name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-medium flex items-center">
            {profile?.name}
            {profile?.linkedinUrl && (
              <Link
                href={profile.linkedinUrl}
                target="_blank"
                className="ml-2 flex items-center text-primary hover:scale-110 transition-transform"
                title="View LinkedIn Profile"
              >
                <Image
                  src="/logos/linkedin-icon.svg"
                  alt="LinkedIn"
                  width={16}
                  height={16}
                />
              </Link>
            )}
          </h2>
          {profile?.graduations && profile.graduations.length > 0 && (
            <div className="text-sm text-muted-foreground mt-1">
              Graduated from
              {profile.graduations.map((graduation, index) => (
                <div key={index} className="font-bold">
                  {graduation.acronym} ({graduation.conclusionYear}) @{graduation.facultyAcronym}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-lg font-semibold">{jobTitle}</div>
              {profile?.role?.seniorityLevel && (
                <>
                <div className="text-xs text-zinc-600">
                  {mapSeniorityLevel(profile?.role?.seniorityLevel)}
                </div>
              <div className="text-xs text-zinc-600">
                {profile?.role?.startDate
                  ? new Date(profile?.role?.startDate).toLocaleDateString(
                      "en-US",
                      { month: "long", year: "numeric" }
                    )
                  : ""}
                {profile?.role?.endDate
                  ? new Date(profile?.role?.endDate).toLocaleDateString(
                      "en-US",
                      { month: "long", year: "numeric" }
                    )
                  : " - Present"}
              </div>
                <Link
                    href={escoUrl}
                    className="text-xs hover:text-primary transition-colors group flex items-center gap-1 mt-4"
                    >
                    In ESCO as <span className="font-bold">{profile?.role?.title}</span>
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                {profile?.company?.logo && (
                  <Image
                    src={profile.company.logo}
                    alt={profile.company.name || ""}
                    className="w-6 h-6 rounded"
                    width={24}
                    height={16}
                  />
                )}
                <Link
                  href={`/company/${profile?.company?.id}`}
                  className="text-lg font-semibold hover:text-primary transition-colors group flex items-center gap-1"
                >
                  {profile?.company?.name || "-"}
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>
              {profile?.company?.industry && (
                <div className="text-xs text-zinc-600">
                  {profile.company.industry}
                </div>
              )}
              <div className="mt-2 flex items-center gap-2">
                {profile?.company?.website && (
                  <Link
                    href={profile.company.website}
                    target="_blank"
                    className="flex items-center text-primary hover:scale-110 transition-transform"
                    title="Visit Website"
                  >
                    <Globe className="w-4 h-4" />
                  </Link>
                )}
                {profile?.company?.linkedinUrl && (
                  <Link
                    href={profile?.company?.linkedinUrl}
                    target="_blank"
                    className="flex items-center text-primary hover:scale-110 transition-transform"
                    title="View on LinkedIn"
                  >
                    <Image
                      src="/logos/linkedin-icon.svg"
                      alt="LinkedIn"
                      width={16}
                      height={16}
                    />
                  </Link>
                )}
              </div>
            </div>

            <div>
              <div className="text-lg font-semibold flex items-center gap-2">
                {profile?.location?.city && profile?.location?.country
                  ? `${profile.location.city}, ${profile.location.country}`
                  : "-"}
                {profile?.location?.countryCode && (
                  <Image
                    src={`https://flagcdn.com/${profile.location.countryCode.toLowerCase()}.svg`}
                    alt={profile.location.country || ""}
                    className="w-6 h-4"
                    width={24}
                    height={16}
                  />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
