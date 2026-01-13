"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icons } from "@/components/shared/icons";

interface IInviteDialogProps {
  projectId: string;
  onSuccess: () => void;
}

export function InviteDialog({ projectId, onSuccess }: IInviteDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("MEMBER");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Only render Dialog after mount to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  async function handleInvite() {
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
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send invitation",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const buttonContent = isLoading ? (
    <>
      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
      Sending...
    </>
  ) : (
    "Send Invitation"
  );

  if (!isMounted) {
    return (
      <Button
        className="bg-gradient-silver transition-silver hover-lift text-background shadow-silver hover:shadow-silver-lg"
        onClick={() => setIsOpen(true)}
      >
        <Icons.add className="mr-2 h-4 w-4" />
        Invite Member
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-silver transition-silver hover-lift text-background shadow-silver hover:shadow-silver-lg">
          <Icons.add className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Send an invitation to join this project. They will receive an email
            with instructions.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email Address</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-role">Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value)}>
              <SelectTrigger id="invite-role">
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
            className="bg-gradient-silver transition-silver hover-lift w-full text-background shadow-silver hover:shadow-silver-lg"
          >
            {buttonContent}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
