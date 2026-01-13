"use client";

import { useState, useTransition } from "react";
import {
  removeMemberAction,
  updateMemberRoleAction,
} from "@/actions/projects/member-actions";
import { IAppRole } from "@/repositories/permissions/roles";
import { IProjectMember } from "@/repositories/projects/members";
import { MoreHorizontal, Shield, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserAvatar } from "@/components/shared/user-avatar";

interface MembersListProps {
  members: (IProjectMember & {
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    } | null;
  })[];
  projectId: string;
  allRoles: IAppRole[];
  canManageRoles: boolean;
  canRemove: boolean;
  currentUserId: string;
}

export function MembersList({
  members,
  projectId,
  allRoles,
  canManageRoles,
  canRemove,
  currentUserId,
}: MembersListProps) {
  const [isRemoving, startRemovingTransition] = useTransition();
  const [isUpdating, startUpdatingTransition] = useTransition();
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [memberToEdit, setMemberToEdit] = useState<(typeof members)[0] | null>(
    null,
  );
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  // Function to handle member removal
  async function handleRemoveMember() {
    if (!memberToRemove) return;

    startRemovingTransition(async () => {
      const result = await removeMemberAction(projectId, memberToRemove);
      if (result.success) {
        toast.success("Member removed successfully");
        setMemberToRemove(null);
      } else {
        toast.error(result.error || "Failed to remove member");
      }
    });
  }

  // Function to handle role update
  async function handleUpdateRoles() {
    if (!memberToEdit) return;

    startUpdatingTransition(async () => {
      // Find role names from checked IDs
      const roleNames = allRoles
        .filter((r) => selectedRoles.includes(r.id))
        .map((r) => r.name);

      const result = await updateMemberRoleAction(
        projectId,
        memberToEdit.userId,
        roleNames,
      );
      if (result.success) {
        toast.success("User roles updated successfully");
        setMemberToEdit(null);
      } else {
        toast.error(result.error || "Failed to update roles");
      }
    });
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead className="text-right">Joined</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    user={{
                      name: member.user?.name || null,
                      image: member.user?.image || null,
                    }}
                    className="size-8"
                  />
                  <span>{member.user?.name || "Unknown User"}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {member.user?.email}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {member.roles.map((role) => (
                    <Badge
                      key={role.id}
                      variant="secondary"
                      className="text-[10px] font-bold uppercase"
                    >
                      {role.name}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">
                {new Date(member.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {(canManageRoles || canRemove) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {canManageRoles && (
                        <DropdownMenuItem
                          onClick={() => {
                            setMemberToEdit(member);
                            setSelectedRoles(member.roles.map((r) => r.id));
                          }}
                        >
                          <Shield className="mr-2 size-4" />
                          Edit Roles
                        </DropdownMenuItem>
                      )}
                      {canRemove && member.userId !== currentUserId && (
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setMemberToRemove(member.userId)}
                        >
                          <Trash2 className="mr-2 size-4" />
                          Remove
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit Roles Dialog */}
      <Dialog
        open={!!memberToEdit}
        onOpenChange={(open) => !open && setMemberToEdit(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Roles</DialogTitle>
            <DialogDescription>
              Assign roles to {memberToEdit?.user?.name || "this user"}. Roles
              define what actions they can perform.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {allRoles.map((role) => (
              <div key={role.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`role-${role.id}`}
                  checked={selectedRoles.includes(role.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedRoles([...selectedRoles, role.id]);
                    } else {
                      setSelectedRoles(
                        selectedRoles.filter((id) => id !== role.id),
                      );
                    }
                  }}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor={`role-${role.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {role.name}
                  </Label>
                  {role.description && (
                    <p className="text-xs text-muted-foreground">
                      {role.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setMemberToEdit(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateRoles}
              disabled={isUpdating || selectedRoles.length === 0}
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation */}
      <AlertDialog
        open={!!memberToRemove}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the
              member from this project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving ? "Removing..." : "Remove Member"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
