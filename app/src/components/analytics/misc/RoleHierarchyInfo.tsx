import { useGetRoleHierarchy } from "@/hooks/analytics/useGetRoleHierarchy";

type RoleHierarchyInfoProps = {
  code: string;
};

export const RoleHierarchyInfo = ({ code }: RoleHierarchyInfoProps) => {
  const { data, isLoading, isError } = useGetRoleHierarchy(code);

  if (isLoading) return <div>Loading hierarchy...</div>;
  if (isError || !data) return <div>Could not load hierarchy.</div>;

  // Assume data is a string like "Managers > ICT Service Managers > Software Developers"
  const levels = data.split(" > ");

  return (
    <div className="flex flex-col gap-1">
      <div className="font-semibold text-sm text-gray-700 mb-1">Hierarchy</div>
      <div className="flex flex-wrap items-center gap-1 text-sm">
        {levels.map((level, idx) => (
          <span key={idx} className="flex items-center">
            {level}
            {idx < levels.length - 1 && (
              <span className="mx-1 text-gray-400">{'>'}</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
};
