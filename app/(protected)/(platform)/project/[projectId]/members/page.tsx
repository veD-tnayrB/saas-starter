import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/repositories/auth/session";
import { findAllRoles } from "@/repositories/permissions/roles";
import { permissionService } from "@/services/permissions/permission-service";
import { memberService } from "@/services/projects/member-service";
import { projectService } from "@/services/projects/project-service";

import { InviteDialog } from "@/components/dashboard/members/invite-dialog";
import { MembersList } from "@/components/dashboard/project/members-list";

interface ProjectMembersPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectMembersPage({
  params,
}: ProjectMembersPageProps) {
  const user = await getCurrentUser();
  if (!user || !user.id) {
    redirect("/login");
  }

  const { projectId } = await params;

  // Verify project exists and user has access
  let project;
  try {
    project = await projectService.getProjectById(projectId, user.id);
  } catch (error) {
    redirect("/project");
  }

  if (!project) {
    redirect("/project");
  }

  // Check permissions
  const permissions = await permissionService.canUserPerformActions(
    user.id,
    projectId,
    ["members.invite", "members.manage_roles", "members.remove"],
  );

  // Fetch all project members
  const members = await memberService.getProjectMembers(projectId);

  // Fetch all available roles for the "Edit Role" functionality
  const allRoles = await findAllRoles();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-row items-center justify-between border-b pb-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Members</h1>
          <p className="text-sm text-muted-foreground">
            View and manage the people who have access to this project.
          </p>
        </div>
        {permissions["members.invite"] && (
          <InviteDialog
            projectId={projectId}
            onSuccess={async () => {
              "use server";
              revalidatePath(`/project/${projectId}/members`);
            }}
          />
        )}
      </div>

      <MembersList
        members={members as any}
        projectId={projectId}
        allRoles={allRoles}
        canManageRoles={permissions["members.manage_roles"]}
        canRemove={permissions["members.remove"]}
        currentUserId={user.id}
      />
    </div>
  );
}
