import StatsCard, { StatsCardProps } from "./StatsCard";

type OverallStatsProps = {
  stats: StatsCardProps[];
};

export default function OverallStats({ stats }: OverallStatsProps) {
  return (
    <div className="overflow-x-auto sm:overflow-visible">
      <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-w-[600px] sm:min-w-0">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>
    </div>
  );
}
