"use client";

import type { IProjectMembersByRole } from "@/repositories/projects";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface IMembersByRoleChartProps {
  data: IProjectMembersByRole;
}

export function MembersByRoleChart({ data }: IMembersByRoleChartProps) {
  const chartData = [
    {
      role: "OWNER",
      count: data.OWNER,
    },
    {
      role: "ADMIN",
      count: data.ADMIN,
    },
    {
      role: "MEMBER",
      count: data.MEMBER,
    },
  ];

  const total = data.OWNER + data.ADMIN + data.MEMBER;

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Members by Role</CardTitle>
          <CardDescription>
            Distribution of team members across different roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="flex items-center justify-center text-sm text-muted-foreground"
            style={{ height: 300, minHeight: 300 }}
          >
            No members data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Members by Role</CardTitle>
        <CardDescription>
          Distribution of team members across different roles
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 py-4">
        <div style={{ width: "100%", height: 300, minHeight: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis
                dataKey="role"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
                domain={[0, "auto"]}
              />
              <Bar
                dataKey="count"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
