import { Card } from "../ui/card";

export type StatsCardProps = {
  icon: React.ReactNode;
  name: string;
  value: number;
};

export default function StatsCard({ icon, name, value }: StatsCardProps) {
  return (
    <Card className="p-4 bg-gradient-to-br from-white to-[#8C2D19]/10 hover:shadow-xl transition-shadow duration-300 rounded-xl border border-gray-200">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-full bg-[#8C2D19]/20 hover:bg-[#8C2D19]/30 transition-colors">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-[#000000]">{name}</p>
          <h3 className="text-3xl font-extrabold text-[#000000]">{value}</h3>
        </div>
      </div>
    </Card>
  );
}
