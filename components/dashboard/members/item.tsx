import { UserAvatar } from "@/components/shared/user-avatar";

interface IProjectMember {
  id: string;
  userId: string;
  roles: Array<{
    name: string;
  }>;
  user?: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

interface IMemberItemProps {
  member: IProjectMember;
  roleDisplay: Record<string, string>;
  roleColors: Record<string, string>;
}

export function MemberItem({
  member,
  roleDisplay,
  roleColors,
}: IMemberItemProps) {
  const userName = member.user?.name || "Unknown User";
  const userEmail = member.user?.email || "No email";
  // Get the highest priority role (first one, as they're sorted by priority)
  const roleName = member.roles[0]?.name || "MEMBER";
  const roleBadgeClass = `rounded-full px-3 py-1 text-xs font-medium ${roleColors[roleName] || ""}`;
  // Show all roles if multiple, otherwise just the role name
  const roleLabel = member.roles.length > 1
    ? `${roleDisplay[roleName] || roleName} (+${member.roles.length - 1})`
    : roleDisplay[roleName] || roleName;

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <UserAvatar
          user={{
            name: member.user?.name || null,
            email: member.user?.email || null,
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
