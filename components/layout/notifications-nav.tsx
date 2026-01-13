"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  acceptInvitationAction,
  declineInvitationAction,
  getUserInvitationsAction,
} from "@/actions/projects/invitation-actions";
import { Bell, Check, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NotificationsNav() {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const result = await getUserInvitationsAction();
      if (result.invitations) {
        setInvitations(result.invitations);
      }
    } catch (error) {
      console.error("Failed to fetch invitations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleAccept = async (token: string) => {
    startTransition(async () => {
      try {
        const result = await acceptInvitationAction(token);
        if (result.success) {
          toast.success("Invitation accepted!");
          fetchInvitations();
          // Force refresh of the project switcher
          window.dispatchEvent(new CustomEvent("projects:refresh"));
          router.push(`/project/${result.projectId}/dashboard`);
        } else {
          toast.error(result.error || "Failed to accept invitation");
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
      }
    });
  };

  const handleDecline = async (token: string) => {
    startTransition(async () => {
      try {
        const result = await declineInvitationAction(token);
        if (result.success) {
          toast.success("Invitation declined");
          fetchInvitations();
        } else {
          toast.error(result.error || "Failed to decline invitation");
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative h-8 w-8 rounded-full border"
        >
          <Bell className="size-4" />
          {invitations.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full p-0 text-[10px]"
            >
              {invitations.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.preventDefault();
              fetchInvitations();
            }}
            disabled={loading}
          >
            <RefreshCw className={`size-3 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-80 overflow-y-auto">
          {invitations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No new invitations
              </p>
            </div>
          ) : (
            invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex flex-col gap-2 p-4 text-sm transition-colors hover:bg-muted/50"
              >
                <div className="space-y-1">
                  <p className="font-medium leading-none">Project Invitation</p>
                  <p className="text-muted-foreground">
                    You've been invited to join{" "}
                    <span className="font-semibold text-foreground">
                      {invitation.projectName}
                    </span>
                    .
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    size="sm"
                    className="h-8 flex-1"
                    onClick={() => handleAccept(invitation.token)}
                    disabled={isPending}
                  >
                    <Check className="mr-2 size-3" />
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 flex-1"
                    onClick={() => handleDecline(invitation.token)}
                    disabled={isPending}
                  >
                    <X className="mr-2 size-3" />
                    Decline
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
