import { cache } from "react";
import { getProjectMemberGrowth } from "@/repositories/projects";

import { MemberGrowthChart } from "@/components/dashboard/member-growth-chart";

interface IMemberGrowthSectionProps {
  projectId: string;
}

const getGrowthData = cache(async (projectId: string) => {
  return getProjectMemberGrowth(projectId);
});

export async function MemberGrowthSection({
  projectId,
}: IMemberGrowthSectionProps) {
  const data = await getGrowthData(projectId);
  return <MemberGrowthChart data={data} />;
}
