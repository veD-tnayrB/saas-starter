"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createActionAction,
  deleteActionAction,
  updateActionAction,
} from "@/actions/permissions";
import { toast } from "sonner";

import { ACTION_CATEGORIES } from "@/lib/permissions/constants";

import { ActionDialog } from "./dialog";
import { ActionsHeader } from "./header";
import { ActionsTable } from "./table";

interface IAction {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IActionsManagementClientProps {
  initialActions: IAction[];
}

export function ActionsManagementClient({
  initialActions,
}: IActionsManagementClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actions, setActions] = useState<IAction[]>(initialActions);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<IAction | null>(null);
  const [formData, setFormData] = useState<{
    slug: string;
    name: string;
    description: string;
    category: string;
  }>({
    slug: "",
    name: "",
    description: "",
    category: ACTION_CATEGORIES.PROJECT,
  });

  function handleEdit(action: IAction) {
    setEditingAction(action);
    setFormData({
      slug: action.slug,
      name: action.name,
      description: action.description || "",
      category: action.category,
    });
    setIsDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      try {
        if (editingAction) {
          await updateActionAction(editingAction.id, formData);
          toast.success("Action updated");
        } else {
          await createActionAction(formData);
          toast.success("Action created");
        }

        setIsDialogOpen(false);
        setEditingAction(null);
        setFormData({
          slug: "",
          name: "",
          description: "",
          category: ACTION_CATEGORIES.PROJECT,
        });
        router.refresh();
      } catch (error) {
        console.error("Error saving action:", error);
        toast.error("Failed to save action");
      }
    });
  }

  async function handleDelete(actionId: string) {
    if (!confirm("Are you sure you want to delete this action?")) return;

    startTransition(async () => {
      try {
        await deleteActionAction(actionId);
        toast.success("Action deleted");
        router.refresh();
      } catch (error) {
        console.error("Error deleting action:", error);
        toast.error("Failed to delete action");
      }
    });
  }

  function handleOpenDialog() {
    setEditingAction(null);
    setFormData({
      slug: "",
      name: "",
      description: "",
      category: ACTION_CATEGORIES.PROJECT,
    });
    setIsDialogOpen(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <ActionsHeader onAddClick={handleOpenDialog} />
      <ActionsTable
        actions={actions}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <ActionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingAction={editingAction}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
        isPending={isPending}
      />
    </div>
  );
}
