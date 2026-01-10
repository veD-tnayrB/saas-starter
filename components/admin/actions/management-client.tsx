"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createActionAction,
  deleteActionAction,
  updateActionAction,
} from "@/actions/permissions/actions";
import { toast } from "sonner";

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
    category: "general",
  });

  function handleOpenDialog() {
    setEditingAction(null);
    setFormData({
      slug: "",
      name: "",
      description: "",
      category: "general",
    });
    setIsDialogOpen(true);
  }

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

  function handleDelete(actionId: string) {
    if (
      !confirm(
        "Are you sure you want to delete this action? This might break existing permissions.",
      )
    )
      return;

    startTransition(async () => {
      try {
        await deleteActionAction(actionId);
        toast.success("Action deleted");
        router.refresh();
        // Optimistic update
        setActions((prev) => prev.filter((a) => a.id !== actionId));
      } catch (error) {
        console.error("Error deleting action:", error);
        toast.error("Failed to delete action");
      }
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      try {
        if (editingAction) {
          // Update
          const { action } = await updateActionAction(editingAction.id, {
            name: formData.name,
            description: formData.description || undefined,
            category: formData.category,
          });
          toast.success("Action updated");
          // Optimistic update (or refetch via router.refresh)
          setActions((prev) =>
            prev.map((a) =>
              a.id === editingAction.id ? { ...a, ...action } : a,
            ),
          );
        } else {
          // Create
          const { action } = await createActionAction({
            slug: formData.slug,
            name: formData.name,
            description: formData.description || undefined,
            category: formData.category,
          });
          toast.success("Action created");
          // Optimistic update
          setActions((prev) => [...prev, action]);
        }
        setIsDialogOpen(false);
        router.refresh();
      } catch (error) {
        console.error("Error saving action:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to save action",
        );
      }
    });
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
