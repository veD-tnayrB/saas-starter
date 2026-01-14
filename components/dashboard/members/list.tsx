import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface IMember {
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

interface IMembersListProps {
  members: IMember[];
  roleDisplay: Record<string, string>;
  roleColors: Record<string, string>;
}

export function MembersList({
  members,
  roleDisplay,
  roleColors,
}: IMembersListProps) {
  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-3">
      {members.map((member) => {
        const primaryRole = member.roles[0]?.name || "MEMBER";

        return (
          <div
            key={member.id}
            className="flex items-center justify-between rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <Avatar className="size-10">
                <AvatarImage
                  src={member.user?.image || undefined}
                  alt={member.user?.name || "User"}
                />
                <AvatarFallback>
                  {getInitials(member.user?.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium leading-none">
                  {member.user?.name || "Unknown User"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {member.user?.email}
                </p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className={roleColors[primaryRole] || ""}
            >
              {roleDisplay[primaryRole] || primaryRole}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}
