import {
  Building2,
  Users,
  Clock,
  Trophy,
  GraduationCap,
  Globe2Icon,
  InfoIcon,
  MapPin,
  Share2,
  Check,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { CompanyInsightsDto } from "@/sdk";
import { companyTypeConfig, companySizeConfig } from "@/lib/mappers";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/misc/useToast";
import { cn } from "@/lib/utils";
import LoadingSkeleton from "./LoadingSkeleton";
import CompanyNotFound from "./CompanyNotFound";
import ComingSoonSection from "./ComingSoonSection";

type props = {
  data?: CompanyInsightsDto;
  isLoading?: boolean;
};

export default function CompanyOverview({ data, isLoading = false }: props) {
  const companyType = data?.companyType
    ? companyTypeConfig[data.companyType]
    : null;
  const companySize = data?.companySize
    ? companySizeConfig[data.companySize]
    : null;
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      toast({
        title: "Link copied!",
        description: "Company profile link has been copied to your clipboard",
        duration: 2000,
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast({
        title: "Failed to copy link",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!data) return <CompanyNotFound />;

  return (
    <div className="relative">
      <Card className="w-[95%] mt-40 sm:w-full md:w-4/5 lg:w-3/5 mx-auto bg-gradient-to-br from-white via-[#FCEFEA] to-[#8C2D19]/10 hover:shadow-xl hover:shadow-[#8C2D19]/20 hover:scale-101 transition-all duration-300 rounded-xl border border-[#8C2D19]/20">
        <CardHeader className="responsive-card-header flex flex-col sm:flex-row items-start gap-4 sm:gap-6 pb-4">
          <Avatar className="h-24 w-24 border-2 border-[#8C2D19]/20 shadow-sm hover:border-[#8C2D19]/50 hover:ring-2 hover:ring-[#8C2D19]/30 transition-all duration-300">
            <AvatarImage src={data.logo || ""} alt={data.name} />
            <AvatarFallback className="text-2xl font-semibold bg-primary/10">
              {data.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-4 flex-1 w-full">
            <div>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-2xl">{data.name}</CardTitle>
                  {companyType && (
                    <Badge
                      variant="outline"
                      className={`${companyType.color} hover:scale-105 hover:shadow-md transition-all duration-300 ease-in-out cursor-default`}
                    >
                      {companyType.label}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1">
                  <div className="flex flex-col sm:flex-row items-end sm:items-center flex-wrap">
                    {data.website && (
                      <Link
                        href={data.website}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-gradient-to-r from-[#8C2D19]/10 to-gray-100 hover:scale-105 transition-all duration-200 rounded-md"
                      >
                        <Globe2Icon className="h-4 w-4" />
                        Visit Website
                      </Link>
                    )}
                    {data.linkedinUrl && (
                      <Link
                        href={data.linkedinUrl}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-gradient-to-r from-[#8C2D19]/10 to-gray-100 hover:scale-105 transition-all duration-200 rounded-md"
                      >
                        <Image
                          src="/logos/linkedin-icon.svg"
                          alt="LinkedIn"
                          width={20}
                          height={20}
                        />
                        LinkedIn Profile
                      </Link>
                    )}
                    {data.levelsFyiUrl && (
                      <div className="relative">
                        <Link
                          href={data.levelsFyiUrl}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-gradient-to-r from-[#8C2D19]/10 to-gray-100 hover:scale-105 transition-all duration-200 rounded-md"
                        >
                          <Image
                            src="/logos/levels-fyi-simple.svg"
                            alt="Levels.fyi"
                            width={20}
                            height={20}
                          />
                          Salary Insights
                        </Link>
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                          className="absolute right-0 -mt-2"
                        >
                          <span className="text-[11px] text-muted-foreground/70 hover:text-muted-foreground transition-colors duration-200 italic px-3">
                            by Levels.fyi
                          </span>
                        </motion.div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {data.foundedByAlumni && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 my-2 rounded-md bg-primary/10 text-primary border border-primary/20 hover:shadow-md hover:shadow-primary/20 transition-all duration-300">
                    <GraduationCap className="h-5 w-5 text-primary hover:text-primary/80" />
                    <span className="text-sm font-medium">
                      Founded by Alumni
                    </span>
                  </div>
                )}
                {data.industry && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    {data.industry.name}
                  </div>
                )}

                {data.headquarters && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {data.headquarters.city}, {data.headquarters.country}
                    </span>
                    {data.headquarters.countryCode && (
                      <Image
                        src={
                          `https://flagcdn.com/${data.headquarters.countryCode.toLowerCase()}.svg` ||
                          ""
                        }
                        alt={data.headquarters.country || ""}
                        width={24}
                        height={16}
                        className="rounded shadow-sm"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <div className="px-6">
          <div className="border-t" />
        </div>
        <CardContent className="pt-4">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:auto-cols-fr md:grid-flow-col gap-x-4 sm:gap-x-6 gap-y-3 text-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
          >
            {companySize && (
              <motion.div
                className="flex flex-col gap-1 sm:gap-2 items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
                  <Users className="h-4 w-4 group-hover:animate-pulse transition-all duration-300" />
                  Company Size
                </span>
                <Badge
                  className={`${companySize.color} w-fit hover:scale-110 transition-transform duration-200 text-xs sm:text-sm`}
                  variant="outline"
                >
                  {companySize.label}
                </Badge>
              </motion.div>
            )}
            {data.averageYOE && (
              <motion.div
                className="flex flex-col gap-1 sm:gap-2 items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
                  <Trophy className="h-4 w-4 group-hover:animate-pulse transition-all duration-300" />
                  <span>Avg. Experience</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground/70" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Average years of professional experience across current
                        employees
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </span>
                <span className="font-medium text-foreground text-sm sm:text-base">
                  {data.averageYOE} years
                </span>
              </motion.div>
            )}
            {data.averageYOC && (
              <motion.div
                className="flex flex-col gap-1 sm:gap-2 items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-4 w-4 group-hover:animate-pulse transition-all duration-300" />
                  <span>Avg. Tenure</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground/70" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Average time employees have spent at the company
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </span>
                <span className="font-medium text-foreground text-sm sm:text-base">
                  {data.averageYOC}
                </span>
              </motion.div>
            )}
          </motion.div>
        </CardContent>
      </Card>

      <ComingSoonSection />

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="fixed bottom-8 right-8 z-50"
          style={{ animation: "float 3s ease-in-out infinite" }}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="lg"
                  className={cn(
                    "h-12 w-12 rounded-full text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 group",
                    isCopied
                      ? "bg-gradient-to-r from-green-500 to-green-600"
                      : "bg-gradient-to-r from-[#8C2D19] to-[#A13A23] hover:bg-gradient-to-r hover:from-[#A13A23] hover:to-[#8C2D19]"
                  )}
                  onClick={handleShare}
                >
                  <AnimatePresence mode="wait">
                    {isCopied ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Check className="h-6 w-6" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="share"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Share2 className="h-6 w-6 group-hover:animate-pulse transition-all duration-300" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="animate-fade-in">
                <p>Share company profile</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
