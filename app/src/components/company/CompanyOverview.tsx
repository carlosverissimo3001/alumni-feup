import { Building2, Users, Calendar, Clock, Trophy, GraduationCap, Globe2Icon, InfoIcon, MapPin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import Link from 'next/link';
import { CompanyInsightsDto } from '@/sdk';
import { companyTypeConfig, companySizeConfig } from '@/lib/mappers';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { motion } from 'framer-motion';
type props = {
  data: CompanyInsightsDto;
}

export default function CompanyOverview({
  data
}: props) {
  const companyType = data.companyType ? companyTypeConfig[data.companyType] : null;
  const companySize = data.companySize ? companySizeConfig[data.companySize] : null;


  return (
    <Card className="w-[95%] md:w-4/5 lg:w-3/5 mx-auto bg-gradient-to-br from-white via-[#FCEFEA] to-[#8C2D19]/10 hover:shadow-xl hover:shadow-[#8C2D19]/20 hover:scale-101 transition-all duration-300 rounded-xl border border-[#8C2D19]/20">
      <CardHeader className="flex flex-row items-start gap-6 pb-4">
        <Avatar className="h-24 w-24 border-2 border-[#8C2D19]/20 shadow-sm hover:border-[#8C2D19]/50 hover:ring-2 hover:ring-[#8C2D19]/30 transition-all duration-300">
          <AvatarImage src={data.logo || ""} alt={data.name} />
          <AvatarFallback className="text-2xl font-semibold bg-primary/10">
            {data.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-4 flex-1">
          <div>
            {/* Changed items-center to items-start here for consistent alignment */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl">{data.name}</CardTitle>
                {companyType && (
                  <Badge
                    className={`${companyType.color} hover:scale-110 transition-transform duration-200`}
                  >
                    {companyType.label}
                  </Badge>
                )}
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center">
                  {data.website && (
                    <Link
                      href={data.website}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-gradient-to-r from-[#8C2D19]/10 to-gray-100 hover:scale-105 transition-all duration-200 rounded-md"
                    >
                      <Globe2Icon className="h-4 w-4" />
                      Visit Website
                    </Link>
                  )}
                  {data.linkedinUrl && (
                    <Link
                      href={data.linkedinUrl}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-gradient-to-r from-[#8C2D19]/10 to-gray-100 hover:scale-105 transition-all duration-200 rounded-md"
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
          className="grid grid-cols-1 sm:grid-cols-2 md:auto-cols-fr md:grid-flow-col gap-x-6 gap-y-3 text-center justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, staggerChildren: 0.1 }}
        >
          {companySize && (
            <motion.div
              className="flex flex-col gap-2 items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Users className="h-4 w-4 group-hover:animate-pulse transition-all duration-300" />
                Company Size
              </span>
              <Badge
                className={`${companySize.color} w-fit hover:scale-110 transition-transform duration-200`}
                variant="outline"
              >
                {companySize.label}
              </Badge>
            </motion.div>
          )}
          {data.founded && (
            <motion.div
              className="flex flex-col gap-2 items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-4 w-4 group-hover:animate-pulse transition-all duration-300" />
                Founded
              </span>
              <span className="font-medium text-foreground">
                {data.founded}
              </span>
            </motion.div>
          )}
          {data.averageYOE && (
            <motion.div
              className="flex flex-col gap-2 items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Trophy className="h-4 w-4 group-hover:animate-pulse transition-all duration-300" />
                <span>Avg. Experience</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="h-3.5 w-3.5 text-muted-foreground/70" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Average years of professional experience across current
                      employees
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
              <span className="font-medium text-foreground">
                {data.averageYOE} years
              </span>
            </motion.div>
          )}
          {data.averageYOC && (
            <motion.div
              className="flex flex-col gap-2 items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-4 w-4 group-hover:animate-pulse transition-all duration-300" />
                <span>Avg. Tenure</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="h-3.5 w-3.5 text-muted-foreground/70" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Average time employees have spent at the company
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
              <span className="font-medium text-foreground">
                {data.averageYOC}
              </span>
            </motion.div>
          )}
        </motion.div>
      </CardContent>
    </Card>
  );
}
