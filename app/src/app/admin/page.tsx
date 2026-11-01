"use client";

import Link from "next/link";
import {
  ActivityIcon,
  BookOpenIcon,
  ChevronRightIcon,
  CreditCardIcon,
  FileSpreadsheetIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { useListFaculties } from "@/hooks/faculty/useListFaculties";
import { useListCourses } from "@/hooks/courses/useListCourses";
import { useBrightDataBalance } from "@/hooks/admin/useBrighDataBalance";
import { useAlumniExtractBalance } from "@/hooks/admin/useAlumniExtractBalance";
import { useListPipelineRuns } from "@/hooks/pipelines/useListPipelineRuns";
import { RunSummaryDtoStatusEnum } from "@/sdk";

type AdminAction = {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  stat?: string;
  live?: boolean;
};

type AdminSection = {
  label: string;
  items: AdminAction[];
};

const pluralize = (count: number, singular: string, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`;

const ACTIVE_RUN_STATUSES: RunSummaryDtoStatusEnum[] = [
  RunSummaryDtoStatusEnum.Planning,
  RunSummaryDtoStatusEnum.Planned,
  RunSummaryDtoStatusEnum.Running,
];

const AdminDashboard = () => {
  const { data: faculties, isLoading: isLoadingFaculties } =
    useListFaculties();
  const { data: courses, isLoading: isLoadingCourses } = useListCourses({});
  const { data: brightDataBalance, isLoading: isLoadingBrightData } =
    useBrightDataBalance();
  const { data: alumniExtractBalance, isLoading: isLoadingAlumniExtract } =
    useAlumniExtractBalance();
  const { data: runs, isLoading: isLoadingRuns } = useListPipelineRuns();

  const activeRunCount =
    runs?.filter((run) => ACTIVE_RUN_STATUSES.includes(run.status)).length ??
    0;

  const sections: AdminSection[] = [
    {
      label: "Data",
      items: [
        {
          title: "Upload extraction CSV",
          description: "Upload and process academic data extraction files",
          icon: <FileSpreadsheetIcon className="h-4 w-4" />,
          href: "/admin/upload-csv",
        },
        {
          title: "Faculty and course management",
          description: "Manage faculties and courses",
          icon: <BookOpenIcon className="h-4 w-4" />,
          href: "/admin/faculty-management",
          stat:
            isLoadingFaculties || isLoadingCourses
              ? undefined
              : `${pluralize(faculties?.length ?? 0, "faculty", "faculties")} · ${pluralize(courses?.length ?? 0, "course")}`,
        },
      ],
    },
    {
      label: "Access",
      items: [
        {
          title: "Manage permissions",
          description: "Search users and assign resource-level permissions",
          icon: <ShieldCheckIcon className="h-4 w-4" />,
          href: "/admin/manage-permissions",
        },
      ],
    },
    {
      label: "Monitoring",
      items: [
        {
          title: "API usage",
          description: "Third-party API balances and usage",
          icon: <CreditCardIcon className="h-4 w-4" />,
          href: "/admin/api-usage",
          stat:
            isLoadingBrightData || isLoadingAlumniExtract
              ? undefined
              : `$${Number(brightDataBalance ?? 0).toFixed(2)} · ${new Intl.NumberFormat("en-US").format(alumniExtractBalance ?? 0)} credits`,
        },
        {
          title: "Pipeline runs",
          description: "View-only status of alumni data pipeline runs",
          icon: <ActivityIcon className="h-4 w-4" />,
          href: "/admin/pipeline-runs",
          stat: isLoadingRuns
            ? undefined
            : activeRunCount > 0
              ? `${activeRunCount} running`
              : "No active runs",
          live: activeRunCount > 0,
        },
      ],
    },
  ];

  return (
    <div className="container mx-auto py-8 min-h-screen bg-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight text-black mb-8">
          Admin panel
        </h1>

        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.label}>
              <h2 className="text-xs font-medium text-gray-500 mb-2">
                {section.label}
              </h2>
              <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {item.title}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {item.description}
                      </p>
                    </div>
                    {item.stat && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.live && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        )}
                        <span className="text-xs font-mono text-gray-500 whitespace-nowrap">
                          {item.stat}
                        </span>
                      </div>
                    )}
                    <ChevronRightIcon className="h-4 w-4 text-gray-300 shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
