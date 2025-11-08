import { Shield, TrendingUp, UserPlus, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      return <Users className="size-4 text-muted-foreground" />;
  }
}

export function ProjectStatsCard({
  title,
  value,
  description,
  icon,
  trend,
}: IProjectStatsCardProps) {
  const trendLabel = trend
    ? `${trend.isPositive ? "+" : ""}${trend.value}% from last month`
    : null;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {getIcon(icon)}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center space-y-2 pt-0">
        <p className="text-2xl font-semibold leading-tight">{value}</p>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
        {trend && trendLabel ? (
          <p
            className={`text-xs ${
              trend.isPositive ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {trendLabel}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
