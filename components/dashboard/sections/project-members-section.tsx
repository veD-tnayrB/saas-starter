import { cache } from "react";
import { memberService } from "@/services/projects";

import { ProjectMembers } from "@/components/dashboard/members";

interface IProjectMembersSectionProps {
  projectId: string;
  userRole: string;
  canManageMembers: boolean;
  canInviteMembers: boolean;
}

const getMembers = cache(async (projectId: string) => {
  return memberService.getProjectMembers(projectId);
});

export async function ProjectMembersSection({
  projectId,
  userRole,
  canManageMembers,
  canInviteMembers,
}: IProjectMembersSectionProps) {
  const members = await getMembers(projectId);
  return (
    <ProjectMembers
      projectId={projectId}
      members={members}
      userRole={userRole}
      canManageMembers={canManageMembers}
      canInviteMembers={canInviteMembers}
    />
  );
}
