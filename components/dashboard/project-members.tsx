"use client";

import { useEffect, useState } from "react";
import type { ProjectRole } from "@prisma/client";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icons } from "@/components/shared/icons";
import { UserAvatar } from "@/components/shared/user-avatar";

interface ProjectMember {
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

interface ProjectMembersProps {
  projectId: string;
  members: ProjectMember[];
  userRole: ProjectRole;
}

export function ProjectMembers({
  projectId,
  members,
  userRole,
}: ProjectMembersProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<ProjectRole>("MEMBER");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Only render Dialog after mount to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const canInvite = userRole === "OWNER" || userRole === "ADMIN";

  const handleInvite = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/projects/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          email,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send invitation");
      }

      toast.success("Invitation sent successfully!");
      setEmail("");
      setRole("MEMBER");
      setIsOpen(false);
      // Refresh the page to show updated members
      window.location.reload();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send invitation",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const roleDisplay: Record<ProjectRole, string> = {
    OWNER: "Owner",
    ADMIN: "Administrator",
    MEMBER: "Member",
  };

  const roleColors: Record<ProjectRole, string> = {
    OWNER: "bg-primary/20 text-primary",
    ADMIN: "bg-primary/15 text-primary/90",
    MEMBER: "bg-muted text-muted-foreground",
  };

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
          {canInvite && isMounted && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-silver shadow-silver hover:shadow-silver-lg transition-silver hover-lift text-background">
                  <Icons.add className="mr-2 h-4 w-4" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation to join this project. They will receive
                    an email with instructions.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="colleague@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Role
                    </label>
                    <Select
                      value={role}
                      onValueChange={(value) => setRole(value as ProjectRole)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Administrator</SelectItem>
                        <SelectItem value="MEMBER">Member</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleInvite}
                    disabled={isLoading || !email}
                    className="bg-gradient-silver shadow-silver hover:shadow-silver-lg transition-silver hover-lift w-full text-background"
                  >
                    {isLoading ? (
                      <>
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Invitation"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          {canInvite && !isMounted && (
            <Button
              className="bg-gradient-silver shadow-silver hover:shadow-silver-lg transition-silver hover-lift text-background"
              onClick={() => setIsOpen(true)}
            >
              <Icons.add className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No members yet. Invite someone to get started!
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-center gap-3">
                  <UserAvatar
                    user={{
                      name: member.user?.name || null,
                      image: member.user?.image || null,
                    }}
                    className="h-10 w-10"
                  />
                  <div>
                    <p className="font-medium text-foreground">
                      {member.user?.name || "Unknown User"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {member.user?.email || "No email"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${roleColors[member.role]}`}
                  >
                    {roleDisplay[member.role]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
