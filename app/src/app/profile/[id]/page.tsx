"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "next/navigation";
import { useFetchBasicProfile } from "@/hooks/profile/useFetchBasicProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Globe, ArrowUpRight, MapPin, Briefcase, Clock, RefreshCw, Trash2, TagIcon, Gauge, Sparkles, Database } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { mapSeniorityLevel } from "@/utils/mappings";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const ESCO_BASE_URL = process.env.NEXT_PUBLIC_ESCO_BASE_URL;

// Placeholder ESCO classifications data
const placeholderEscoL1Options = [
  { label: "Software Developers", value: "2512", icon: Database },
  { label: "Web and Multimedia Developers", value: "2513", icon: Globe },
  { label: "Systems Analysts", value: "2511", icon: Briefcase },
  { label: "Database Designers and Administrators", value: "2521", icon: Database },
  { label: "Systems Administrators", value: "2522", icon: Briefcase },
  { label: "Computer Network Professionals", value: "2523", icon: Globe },
  { label: "AI and Machine Learning Specialists", value: "2519.1", icon: Sparkles },
  { label: "Application Programmers", value: "2514", icon: Database },
];

const placeholderEscoL2Options = [
  { label: "Frontend Developer", value: "2513.1", icon: Globe },
  { label: "Backend Developer", value: "2512.1", icon: Database },
  { label: "Full Stack Developer", value: "2512.2", icon: Database },
  { label: "Mobile Application Developer", value: "2514.1", icon: Database },
  { label: "Data Engineer", value: "2521.1", icon: Database },
  { label: "DevOps Engineer", value: "2522.1", icon: Briefcase },
  { label: "Cloud Engineer", value: "2522.2", icon: Globe },
  { label: "React Developer", value: "2513.2", icon: Globe },
  { label: "JavaScript Developer", value: "2513.3", icon: Globe },
  { label: "Python Developer", value: "2512.3", icon: Database },
];

export default function Profile() {
  const { id } = useParams();
  const {
    data: profile,
    isLoading,
    error,
  } = useFetchBasicProfile({id: id as string});

  const escoUrl = ESCO_BASE_URL ? ESCO_BASE_URL + profile?.role?.escoCode : '#';
  
  // For placeholder purposes, simulate confidence if not provided
  const confidenceValue = 0.65;
  
  // State for selected ESCO classifications
  const [selectedEscoL1, setSelectedEscoL1] = useState<string[]>([]);
  const [selectedEscoL2, setSelectedEscoL2] = useState<string[]>([]);
  const [escoDialogOpen, setEscoDialogOpen] = useState(false);

  // Placeholder function for updating ESCO classifications
  const handleUpdateEsco = () => {
    console.log("Updating ESCO classifications:", {
      level1: selectedEscoL1,
      level2: selectedEscoL2,
    });
    // Here you would call your API to update the classifications
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
          <AlertDescription className="text-base">Error loading profile: {error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Get the job title from the first job classification if available
  const jobTitle = profile?.role?.title;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10">
        <Avatar className="h-24 w-24 border-2 border-primary shadow-md">
          <AvatarImage
            src={profile?.profilePictureUrl || "/placeholder-avatar.png"}
            alt="Profile"
          />
          <AvatarFallback className="text-xl font-semibold bg-primary/10">
            {profile?.name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-3xl font-bold flex items-center">
            {profile?.name}
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
                  {graduation.acronym} ({graduation.conclusionYear}) @{graduation.facultyAcronym}
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
            Career Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="text-lg font-semibold">{jobTitle || "No role specified"}</div>
              {profile?.role?.seniorityLevel && (
                <>
                <div className="flex items-center text-sm text-muted-foreground">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary/80 mr-2"></span>
                  {mapSeniorityLevel(profile?.role?.seniorityLevel)}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                  {profile?.role?.startDate
                    ? new Date(profile?.role?.startDate).toLocaleDateString(
                        "en-US",
                        { month: "long", year: "numeric" }
                      )
                    : ""}
                  {profile?.role?.endDate
                    ? ` to ${new Date(profile?.role?.endDate).toLocaleDateString(
                        "en-US",
                        { month: "long", year: "numeric" }
                      )}`
                    : " - Present"}
                </div>
                  <Link
                      href={escoUrl}
                      className="text-xs hover:text-primary transition-colors group flex items-center gap-1 mt-2"
                      >
                      In ESCO as <span className="font-bold underline">{profile?.role?.title}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover:text-primary transition-colors" />
                    </Link>
                </>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {profile?.company?.logo && (
                  <div className="bg-white p-1 rounded-md shadow-sm">
                    <Image
                      src={profile.company.logo}
                      alt={profile.company.name || ""}
                      className="w-7 h-7 object-contain"
                      width={28}
                      height={28}
                    />
                  </div>
                )}
                <Link
                  href={`/company/${profile?.company?.id}`}
                  className="text-lg font-semibold hover:text-primary transition-colors group flex items-center gap-1"
                >
                  {profile?.company?.name || "No company specified"}
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>
              {profile?.company?.industry && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <span className="inline-block w-2 h-2 rounded-full bg-zinc-400 mr-2"></span>
                  {profile.company.industry}
                </div>
              )}
              <div className="mt-3 flex items-center gap-3">
                {profile?.company?.website && (
                  <Link
                    href={profile.company.website}
                    target="_blank"
                    className="flex items-center text-primary hover:text-primary/80 transition-colors"
                    title="Visit Website"
                  >
                    <Globe className="w-4 h-4" />
                  </Link>
                )}
                {profile?.company?.linkedinUrl && (
                  <Link
                    href={profile?.company?.linkedinUrl}
                    target="_blank"
                    className="flex items-center text-primary hover:text-primary/80 transition-colors"
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

            <div className="space-y-2">
              <div className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {profile?.location?.city && profile?.location?.country
                  ? `${profile.location.city}, ${profile.location.country}`
                  : "Location not specified"}
              </div>
              {profile?.location?.countryCode && (
                <div className="mt-2">
                  <Image
                    src={`https://flagcdn.com/${profile.location.countryCode.toLowerCase()}.svg`}
                    alt={profile.location.country || ""}
                    className="w-8 h-5 rounded shadow-sm"
                    width={32}
                    height={20}
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

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
              If you have recently updated your LinkedIn profile, you can request an update to this profile. We update all profiles automatically, every X days.
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
              If you want to delete your account, you can request it here. We will delete your account and all your data from our database.
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
              Our AI might have incorrectly classified your role. You can help us improve by updating your ESCO job classification.
            </p>
            <div className="pt-4 mt-auto">
              <Dialog open={escoDialogOpen} onOpenChange={setEscoDialogOpen}>
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
                      ESCO is the European multilingual classification of Skills, Competences, Qualifications and Occupations.
                      Our AI has classified your role, but you can refine it below.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="mt-4 space-y-6">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Gauge className="h-4 w-4 text-amber-500" />
                          <p className="text-sm font-medium">Current Classification</p>
                        </div>
                        <Badge variant="outline" className="bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200">
                          {profile?.role?.escoCode || "Not Classified"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Currently classified as <span className="font-semibold">{profile?.role?.title || "Unknown"}</span>
                      </p>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Classification Confidence</p>
                          <span className="text-xs font-medium">{Math.round(confidenceValue * 100)}%</span>
                        </div>
                        <Progress 
                          value={confidenceValue * 100} 
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs mt-1">
                          <span className={confidenceValue < 0.6 ? "font-medium text-red-500" : "text-muted-foreground"}>Low</span>
                          <span className={confidenceValue >= 0.6 && confidenceValue <= 0.8 ? "font-medium text-amber-500" : "text-muted-foreground"}>Medium</span>
                          <span className={confidenceValue > 0.8 ? "font-medium text-green-500" : "text-muted-foreground"}>High</span>
                        </div>
                      </div>
                    </div>

                    <Tabs defaultValue="level1" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="level1" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900">
                          Level 1 (General)
                        </TabsTrigger>
                        <TabsTrigger value="level2" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900">
                          Level 2 (Specific)
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="level1" className="mt-4">
                        <p className="text-sm text-muted-foreground mb-2">
                          Select the general job classification that best represents your role:
                        </p>
                        <MultiSelect
                          options={placeholderEscoL1Options}
                          placeholder="Select a classification..."
                          onValueChange={setSelectedEscoL1}
                          maxCount={1}
                          className="w-full border-amber-200 focus-within:border-amber-500"
                          animation={0.5}
                          variant="secondary"
                        />
                      </TabsContent>
                      <TabsContent value="level2" className="mt-4">
                        <p className="text-sm text-muted-foreground mb-2">
                          Select the specific job classifications that best represent your role (up to 3):
                        </p>
                        <MultiSelect
                          options={placeholderEscoL2Options}
                          placeholder="Select classifications..."
                          onValueChange={setSelectedEscoL2}
                          maxCount={3}
                          className="w-full border-amber-200 focus-within:border-amber-500"
                          animation={0.5}
                          variant="secondary"
                        />
                      </TabsContent>
                    </Tabs>
                  </div>

                  <DialogFooter className="mt-6">
                    <Button variant="ghost" onClick={() => setEscoDialogOpen(false)}>Cancel</Button>
                    <Button 
                      variant="default" 
                      className="bg-amber-500 hover:bg-amber-600 text-white"
                      onClick={handleUpdateEsco}
                      disabled={selectedEscoL1.length === 0 && selectedEscoL2.length === 0}
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
    </div>
  );
}
