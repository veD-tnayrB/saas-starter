import type { ProjectRole } from "@prisma/client";

import { UserAvatar } from "@/components/shared/user-avatar";

interface IProjectMember {
  id: string;
  userId: string;
  role: ProjectRole;
  user?: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

interface IMemberItemProps {
  member: IProjectMember;
  roleDisplay: Record<ProjectRole, string>;
  roleColors: Record<ProjectRole, string>;
}

export function MemberItem({
  member,
  roleDisplay,
  roleColors,
}: IMemberItemProps) {
  const userName = member.user?.name || "Unknown User";
  const userEmail = member.user?.email || "No email";
  const roleBadgeClass = `rounded-full px-3 py-1 text-xs font-medium ${roleColors[member.role]}`;
  const roleLabel = roleDisplay[member.role];

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <UserAvatar
          user={{
            name: member.user?.name || null,
            image: member.user?.image || null,
          }}
          className="h-10 w-10"
        />
        <div>
          <p className="font-medium text-foreground">{userName}</p>
          <p className="text-sm text-muted-foreground">{userEmail}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={roleBadgeClass}>{roleLabel}</span>
      </div>
    </div>
  );
}
