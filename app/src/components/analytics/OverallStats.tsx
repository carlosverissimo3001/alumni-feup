import StatsCard, { StatsCardProps } from "./StatsCard";

type OverallStatsProps = {
  stats: StatsCardProps[];
};

export default function OverallStats({ stats }: OverallStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
}
