import { ArrowDown, ArrowUp, LucideIcon, Minus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return ArrowUp;
    if (trend.value < 0) return ArrowDown;
    return Minus;
  };

  const getTrendColor = () => {
    if (!trend) return "";
    if (trend.value > 0) return "text-green-600 dark:text-green-500";
    if (trend.value < 0) return "text-red-600 dark:text-red-500";
    return "text-muted-foreground";
  };

  const TrendIcon = getTrendIcon();

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="size-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <div className="mt-1 flex items-center gap-2 text-xs">
            {trend && TrendIcon && (
              <span className={cn("flex items-center gap-1", getTrendColor())}>
                <TrendIcon className="size-3" />
                {Math.abs(trend.value)}%
              </span>
            )}
            <span className="text-muted-foreground">
              {trend?.label || description}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
