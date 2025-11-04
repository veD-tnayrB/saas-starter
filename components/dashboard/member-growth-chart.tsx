"use client";

import type { IMemberGrowthDataPoint } from "@/repositories/projects";
import { format } from "date-fns";
import { Line, LineChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface IMemberGrowthChartProps {
  data: IMemberGrowthDataPoint[];
}

const chartConfig = {
  count: {
    label: "Members",
    color: "hsl(var(--chart-1))",
  },
};

export function MemberGrowthChart({ data }: IMemberGrowthChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Member Growth</CardTitle>
          <CardDescription>
            Team size evolution over the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            No growth data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((point) => ({
    date: format(new Date(point.date), "MMM dd"),
    count: point.count,
    fullDate: point.date,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Member Growth</CardTitle>
        <CardDescription>
          Team size evolution over the last 30 days
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart data={chartData}>
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            <Line
              type="monotone"
              dataKey="count"
              stroke="var(--color-count)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
