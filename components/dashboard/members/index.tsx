"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { InviteDialog } from "./invite-dialog";
import { MembersList } from "./list";

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

interface IProjectMembersProps {
  projectId: string;
  members: IProjectMember[];
  userRole: string;
  canManageMembers: boolean;
  canInviteMembers: boolean;
}

export function ProjectMembers({
  projectId,
  members,
  userRole,
  canManageMembers,
  canInviteMembers,
}: IProjectMembersProps) {
  function handleInviteSuccess() {
    // Refresh the page to show updated members
    window.location.reload();
  }

  const roleDisplay: Record<string, string> = {
    OWNER: "Owner",
    ADMIN: "Administrator",
    MEMBER: "Member",
  };

  const roleColors: Record<string, string> = {
    OWNER: "bg-primary/20 text-primary",
    ADMIN: "bg-primary/15 text-primary/90",
    MEMBER: "bg-muted text-muted-foreground",
  };

  const hasMembers = members.length > 0;
  const emptyStateMessage = "No members yet. Invite someone to get started!";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              Manage team members and their roles in this project.
            </CardDescription>
          </div>
          {canInviteMembers && (
            <InviteDialog
              projectId={projectId}
              onSuccess={handleInviteSuccess}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {hasMembers ? (
          <MembersList
            members={members}
            roleDisplay={roleDisplay}
            roleColors={roleColors}
          />
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            {emptyStateMessage}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
