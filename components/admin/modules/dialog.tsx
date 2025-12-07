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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ActionsSelector } from "./actions-selector";

interface IModule {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  isActive: boolean;
}

interface IAction {
  id: string;
  slug: string;
  name: string;
  category: string;
}

interface IModuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingModule: IModule | null;
  formData: {
    slug: string;
    name: string;
    description: string;
    icon: string;
    isActive: boolean;
    actionIds: string[];
  };
  onFormDataChange: (data: {
    slug: string;
    name: string;
    description: string;
    icon: string;
    isActive: boolean;
    actionIds: string[];
  }) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  availableActions: IAction[];
}

export function ModuleDialog({
  open,
  onOpenChange,
  editingModule,
  formData,
  onFormDataChange,
  onSubmit,
  isPending,
  availableActions,
}: IModuleDialogProps) {
  const dialogTitle = editingModule ? "Edit Module" : "Create Module";
  const dialogDescription = editingModule
    ? "Update the module details."
    : "Create a new module for the application.";
  const submitButtonText = editingModule ? "Update" : "Create";

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    onFormDataChange({ ...formData, slug: e.target.value });
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    onFormDataChange({ ...formData, name: e.target.value });
  }

  function handleIconChange(e: React.ChangeEvent<HTMLInputElement>) {
    onFormDataChange({ ...formData, icon: e.target.value });
  }

  function handleDescriptionChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    onFormDataChange({ ...formData, description: e.target.value });
  }

  function handleIsActiveChange(checked: boolean) {
    onFormDataChange({ ...formData, isActive: checked });
  }

  function handleActionsChange(actionIds: string[]) {
    onFormDataChange({ ...formData, actionIds });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
              disabled={!!editingModule || isPending}
              placeholder="module-name"
            />
            <p className="text-xs text-muted-foreground">
              Unique identifier for the module (e.g., module-name)
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
              placeholder="Module Name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="icon">Icon (SVG name)</Label>
            <Input
              id="icon"
              value={formData.icon}
              onChange={handleIconChange}
              disabled={isPending}
              placeholder="icon-name"
            />
            <p className="text-xs text-muted-foreground">
              Name of the SVG icon to display in the sidebar
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
              placeholder="Module description"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={handleIsActiveChange}
              disabled={isPending}
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Active
            </Label>
          </div>
          <ActionsSelector
            actions={availableActions}
            selectedActionIds={formData.actionIds}
            onSelectionChange={handleActionsChange}
          />
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
              {submitButtonText}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

