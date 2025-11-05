"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface IAppRole {
  id: string;
  name: string;
  priority: number;
  description: string | null;
}

interface IRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRole: IAppRole | null;
  formData: {
    name: string;
    priority: number;
    description: string;
  };
  onFormDataChange: (data: {
    name: string;
    priority: number;
    description: string;
  }) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
}

export function RoleDialog({
  open,
  onOpenChange,
  editingRole,
  formData,
  onFormDataChange,
  onSubmit,
  isPending,
}: IRoleDialogProps) {
  const dialogTitle = editingRole ? "Edit Role" : "Create Role";
  const dialogDescription = editingRole
    ? "Update the role details."
    : "Create a new role for the application.";

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    onFormDataChange({ ...formData, name: e.target.value });
  }

  function handlePriorityChange(e: React.ChangeEvent<HTMLInputElement>) {
    onFormDataChange({
      ...formData,
      priority: parseInt(e.target.value, 10),
    });
  }

  function handleDescriptionChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    onFormDataChange({ ...formData, description: e.target.value });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleNameChange}
              required
              disabled={!!editingRole || isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Input
              id="priority"
              type="number"
              value={formData.priority}
              onChange={handlePriorityChange}
              required
              min={0}
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              Lower numbers = higher permissions (0 = highest)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={handleDescriptionChange}
              rows={3}
              disabled={isPending}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {editingRole ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


