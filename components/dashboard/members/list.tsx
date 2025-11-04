import type { ProjectRole } from "@prisma/client";

import { MemberItem } from "./item";

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

interface IMembersListProps {
  members: IProjectMember[];
  roleDisplay: Record<ProjectRole, string>;
  roleColors: Record<ProjectRole, string>;
}

export function MembersList({
  members,
  roleDisplay,
  roleColors,
}: IMembersListProps) {
  const memberItems = members.map((member) => (
    <MemberItem
      key={member.id}
      member={member}
      roleDisplay={roleDisplay}
      roleColors={roleColors}
    />
  ));

  return <div className="space-y-3">{memberItems}</div>;
}
