import { cache } from "react";
import { getProjectInvitationStats } from "@/repositories/projects";

import { InvitationsChart } from "@/components/dashboard/invitations-chart";

interface IInvitationsChartSectionProps {
  projectId: string;
}

const getChartData = cache(async (projectId: string) => {
  return getProjectInvitationStats(projectId);
});

export async function InvitationsChartSection({
  projectId,
}: IInvitationsChartSectionProps) {
  const data = await getChartData(projectId);
  return <InvitationsChart data={data} />;
}
