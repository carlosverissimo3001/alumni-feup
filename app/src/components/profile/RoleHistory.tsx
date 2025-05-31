import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, Briefcase, Clock, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { mapSeniorityLevel } from "@/utils/mappings";
import { RoleAnalyticsEntity } from "@/sdk";

interface RoleHistoryProps {
  roles: RoleAnalyticsEntity[];
}

export default function RoleHistory({ roles }: RoleHistoryProps) {
  const [open, setOpen] = useState(false);
  if (!roles?.length) return null;

  // Sort roles by startDate descending
  const sortedRoles = [...roles].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  return (
    <Card className="mb-10 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-xl flex items-center">
          <Briefcase className="mr-2 h-5 w-5 text-primary" />
          Role History
        </CardTitle>
        <button
          className="text-primary underline text-sm"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Hide" : "Show"}
        </button>
      </CardHeader>
      {open && (
        <CardContent className="pt-3">
          <div className="flex flex-col gap-6">
            {sortedRoles.map((role) => (
              <div key={role.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                <div className="flex flex-col md:flex-row md:items-center md:gap-6 gap-2">
                  <div className="flex-1">
                    <div className="text-lg font-semibold">
                      {role.jobClassification?.escoClassification?.titleEn || "No title"}
                    </div>
                    {role.seniorityLevel && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span className="inline-block w-2 h-2 rounded-full bg-primary/80 mr-2"></span>
                        {mapSeniorityLevel(role.seniorityLevel)}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                      {role.startDate
                        ? new Date(role.startDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })
                        : ""}
                      {role.endDate
                        ? ` to ${new Date(role.endDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })}`
                        : " - Present"}
                    </div>
                    {role.jobClassification?.escoClassification?.escoUrl && (
                      <Link
                        href={role.jobClassification.escoClassification.escoUrl}
                        className="text-xs hover:text-primary transition-colors group flex items-center gap-1 mt-2"
                        target="_blank"
                      >
                        In ESCO as {" "}
                        <span className="font-bold underline">
                          {role.jobClassification.escoClassification.titleEn}
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 group-hover:text-primary transition-colors" />
                      </Link>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {role.company?.logo && (
                        <div className="bg-white p-1 rounded-md shadow-sm">
                          <Image
                            src={role.company.logo}
                            alt={role.company.name || ""}
                            className="w-7 h-7 object-contain"
                            width={28}
                            height={28}
                          />
                        </div>
                      )}
                      <Link
                        href={`/company/${role.company?.id}`}
                        className="text-lg font-semibold hover:text-primary transition-colors group flex items-center gap-1"
                      >
                        {role.company?.name || "No company specified"}
                        <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </div>
                    {role.company?.industry && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span className="inline-block w-2 h-2 rounded-full bg-zinc-400 mr-2"></span>
                        {role.company.industry.name}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {role.location?.city && role.location?.country
                        ? `${role.location.city}, ${role.location.country}`
                        : "Location not specified"}
                      {role.location?.countryCode && (
                        <Image
                          src={`https://flagcdn.com/${role.location.countryCode.toLowerCase()}.svg`}
                          alt={role.location.country || ""}
                          className="w-8 h-5 rounded shadow-sm ml-2"
                          width={32}
                          height={20}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
} 
