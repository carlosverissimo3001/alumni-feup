import StatsCard, { StatsCardProps } from "./StatsCard";

type OverallStatsProps = {
  stats: StatsCardProps[];
};

export default function OverallStats({ stats }: OverallStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
}
