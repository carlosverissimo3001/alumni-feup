import { useGetRoleHierarchy } from "@/hooks/analytics/useGetRoleHierarchy";
import { Button } from "@/components/ui/button";

type RoleHierarchyInfoProps = {
  code: string;
};

export const RoleHierarchyInfo = ({ code }: RoleHierarchyInfoProps) => {
  const { data, isLoading, isError } = useGetRoleHierarchy(code);

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading hierarchy...</div>;
  }

  if (isError || !data?.hierarchy || !Array.isArray(data.hierarchy)) {
    return <div className="text-sm text-red-600 font-medium">Failed to load hierarchy.</div>;
  }

  return (
    <div className="flex flex-wrap items-center gap-1 text-sm text-gray-900 break-words">
      {data.hierarchy.map((level, idx) => {
        const lastLevel = idx === data.hierarchy.length - 1;

        return (
          <span key={level.code} className="flex items-center">
            <Button
              variant="link"
              size="sm"
              className={`p-0 h-auto text-xs font-medium transition-colors duration-200 break-words ${
                lastLevel
                  ? "text-[#8C2D19] font-semibold underline underline-offset-4 decoration-2"
                  : "text-gray-600 hover:text-[#8C2D19]"
              }`}
              onClick={() => window.open(level.escoUrl, "_blank")}
              title={level.title}
            >
              {level.title}
            </Button>
            {!lastLevel && <span className="mx-1 text-gray-400">{"\u2192"}</span>}
          </span>
        );
      })}
    </div>
  );
};
