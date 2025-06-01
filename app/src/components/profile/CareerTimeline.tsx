import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, ChevronDown, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { RoleAnalyticsEntity } from "@/sdk";
import clsx from "clsx";
import { Button } from "../ui/button";
import { CareerTimelineItem } from "./CareerTimelineItem";
import Image from "next/image";
import Link from "next/link";
import { calculateDuration } from "@/utils/date";

interface CareerTimelineProps {
  roles: RoleAnalyticsEntity[];
}

interface GroupedRoles {
  companyId: string;
  companyName: string;
  companyLogo?: string;
  companyIndustry?: {
    name: string;
  };
  website?: string;
  linkedinUrl?: string;
  totalDuration: string;
  roles: RoleAnalyticsEntity[];
}

export default function CareerTimeline({ roles }: CareerTimelineProps) {
  const [open, setOpen] = useState(false);
  if (!roles?.length) return null;

  const groupedRoles = roles.reduce<GroupedRoles[]>((acc, role) => {
    if (!role.company?.id) return acc;

    const existingGroup = acc.find(
      (group) => group.companyId === role.company!.id
    );
    if (existingGroup) {
      existingGroup.roles.push(role);
    } else {
      const startDate = new Date(role.startDate);
      const endDate = role.endDate ? new Date(role.endDate) : null;

      acc.push({
        companyId: role.company.id,
        companyName: role.company.name || "Unknown Company",
        companyLogo: role.company.logo,
        companyIndustry: role.company.industry,
        website: role.company.website,
        linkedinUrl: role.company.linkedinUrl,
        totalDuration: calculateDuration(startDate, endDate),
        roles: [role],
      });
    }
    return acc;
  }, []);

  groupedRoles.forEach((group) => {
    group.roles.sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );

    if (group.roles.length > 1) {
      const earliestStart = new Date(
        Math.min(...group.roles.map((r) => new Date(r.startDate).getTime()))
      );
      const latestEnd = group.roles.some((r) => !r.endDate)
        ? null
        : new Date(
            Math.max(
              ...group.roles.map((r) =>
                r.endDate ? new Date(r.endDate).getTime() : 0
              )
            )
          );
      group.totalDuration = calculateDuration(earliestStart, latestEnd);
    }
  });

  const sortedGroups = groupedRoles.sort((a, b) => {
    const aLatestDate = Math.max(
      ...a.roles.map((r) => new Date(r.startDate).getTime())
    );
    const bLatestDate = Math.max(
      ...b.roles.map((r) => new Date(r.startDate).getTime())
    );
    return bLatestDate - aLatestDate;
  });

  return (
    <Card className="mb-6 mt-6 shadow-sm hover:shadow-md transition-shadow duration-300 bg-transparent backdrop-blur-sm">
      <CardHeader
        className="py-2 flex flex-row items-center justify-between cursor-pointer hover:bg-primary/5 transition-colors"
        onClick={() => setOpen((open) => !open)}
      >
        <CardTitle className="text-xl flex items-center">
          <Briefcase className="mr-2 h-5 w-5 text-primary" />
          Career Timeline
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="text-primary hover:text-primary/80 hover:bg-transparent"
          onClick={() => setOpen((open) => !open)}
        >
          <ChevronDown
            className={clsx(
              "transition-transform duration-300",
              open ? "rotate-180" : "rotate-0"
            )}
            size={18}
          />
        </Button>
      </CardHeader>
      <div
        className={clsx(
          "overflow-hidden transition-all duration-500",
          open ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <CardContent className="pt-3">
          <div className="relative flex flex-col gap-8">
            {sortedGroups.map((group) => (
              <div key={group.companyId} className="relative pl-12">
                {/* Company logo */}
                <div className="absolute left-0 top-0">
                  <div className="w-10 h-10 rounded-lg bg-white/70 backdrop-blur-sm border border-primary/20 shadow-sm flex items-center justify-center overflow-hidden">
                    {group.companyLogo ? (
                      <Image
                        src={group.companyLogo}
                        alt={group.companyName}
                        width={32}
                        height={32}
                        className="object-contain w-8 h-8"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-primary/80">
                        {group.companyName[0]}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col">
                  {/* Company header */}
                  <div className="mb-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/company/${group.companyId}`}
                        className="text-lg font-semibold text-foreground hover:text-primary transition-colors group flex items-center"
                      >
                        {group.companyName}
                        <ArrowUpRight className="w-4 h-4 ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {group.totalDuration} · {group.roles.length} role
                      {group.roles.length !== 1 ? "s" : ""}
                      {group.companyIndustry && (
                        <span className="inline-flex items-center">
                          <span className="mx-2 w-1 h-1 rounded-full bg-primary/20" />
                          {group.companyIndustry.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Roles */}
                  <div className="flex flex-col">
                    {group.roles.map((role, index) => (
                      <div
                        key={role.id}
                        className={clsx(
                          "relative",
                          index !== 0 &&
                            "ml-3 pl-6 border-l-2 border-primary/10",
                          index !== group.roles.length - 1 && "mb-6"
                        )}
                      >
                        <CareerTimelineItem
                          roleId={role.id}
                          showCompanyInfo={false}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
