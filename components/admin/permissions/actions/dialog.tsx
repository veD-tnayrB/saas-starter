"use client";

import { ACTION_CATEGORIES } from "@/lib/permissions/constants";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface IAction {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
}

interface IActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingAction: IAction | null;
  formData: {
    slug: string;
    name: string;
    description: string;
    category: string;
  };
  onFormDataChange: (data: {
    slug: string;
    name: string;
    description: string;
    category: string;
  }) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
}

const categories = Object.values(ACTION_CATEGORIES);

export function ActionDialog({
  open,
  onOpenChange,
  editingAction,
  formData,
  onFormDataChange,
  onSubmit,
  isPending,
}: IActionDialogProps) {
  const dialogTitle = editingAction ? "Edit Action" : "Create Action";
  const dialogDescription = editingAction
    ? "Update the action details."
    : "Create a new action for the application.";

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    onFormDataChange({ ...formData, slug: e.target.value });
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    onFormDataChange({ ...formData, name: e.target.value });
  }

  function handleCategoryChange(value: string) {
    onFormDataChange({ ...formData, category: value });
  }

  function handleDescriptionChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    onFormDataChange({ ...formData, description: e.target.value });
  }

  const categoryItems: React.ReactElement[] = [];
  for (const category of categories) {
    categoryItems.push(
      <SelectItem key={category} value={category}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </SelectItem>,
    );
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
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={handleSlugChange}
              required
              disabled={!!editingAction || isPending}
              placeholder="project:create"
            />
            <p className="text-xs text-muted-foreground">
              Format: category:action (e.g., project:create)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleNameChange}
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={handleCategoryChange}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>{categoryItems}</SelectContent>
            </Select>
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
              {editingAction ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
