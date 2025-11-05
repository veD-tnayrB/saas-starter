import { Shield, TrendingUp, UserPlus, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/shared/icons";

interface IProjectStatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: "users" | "userPlus" | "shield" | "trendingUp";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function getIcon(icon: IProjectStatsCardProps["icon"]) {
  switch (icon) {
    case "users":
      return <Users className="size-4 text-muted-foreground" />;
    case "userPlus":
      return <UserPlus className="size-4 text-muted-foreground" />;
    case "shield":
      return <Shield className="size-4 text-muted-foreground" />;
    case "trendingUp":
      return <TrendingUp className="size-4 text-muted-foreground" />;
    default:
      return <Icons.logo className="size-4 text-muted-foreground" />;
  }
}

export function ProjectStatsCard({
  title,
  value,
  description,
  icon,
  trend,
}: IProjectStatsCardProps) {
  const trendText = trend
    ? `${trend.isPositive ? "+" : ""}${trend.value}%`
    : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {getIcon(icon)}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && trendText && (
          <p
            className={`mt-1 text-xs ${
              trend.isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {trendText} from last month
          </p>
        )}
      </CardContent>
    </Card>
  );
}
