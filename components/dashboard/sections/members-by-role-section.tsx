import { cache } from "react";
import { getProjectMembersByRole } from "@/repositories/projects";

import { MembersByRoleChart } from "@/components/dashboard/members-by-role-chart";

interface IMembersByRoleSectionProps {
  projectId: string;
}

const getMembersByRole = cache(async (projectId: string) => {
  return getProjectMembersByRole(projectId);
});

export async function MembersByRoleSection({
  projectId,
}: IMembersByRoleSectionProps) {
  const data = await getMembersByRole(projectId);
  return <MembersByRoleChart data={data} />;
}
