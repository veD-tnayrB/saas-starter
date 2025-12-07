"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createModuleAction,
  deleteModuleAction,
  setModuleActionsAction,
  updateModuleAction,
} from "@/actions/modules";
import { toast } from "sonner";

import { ModuleDialog } from "./dialog";
import { ModulesHeader } from "./header";
import { ModulesTable } from "./table";

interface IModule {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IAction {
  id: string;
  slug: string;
  name: string;
  category: string;
}

interface IModulesManagementClientProps {
  initialModules: IModule[];
  availableActions: IAction[];
  projectId: string;
}

export function ModulesManagementClient({
  initialModules,
  availableActions,
  projectId,
}: IModulesManagementClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [modules, setModules] = useState<IModule[]>(initialModules);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<IModule | null>(null);
  const [formData, setFormData] = useState<{
    slug: string;
    name: string;
    description: string;
    icon: string;
    isActive: boolean;
    actionIds: string[];
  }>({
    slug: "",
    name: "",
    description: "",
    icon: "",
    isActive: true,
    actionIds: [],
  });

  async function handleEdit(module: IModule) {
    // Fetch module with actions
    try {
      const response = await fetch(
        `/api/modules/${module.id}?projectId=${projectId}`,
      );
      if (response.ok) {
        const data = await response.json();
        const moduleWithActions = data.module;
        setEditingModule(module);
        setFormData({
          slug: module.slug,
          name: module.name,
          description: module.description || "",
          icon: module.icon || "",
          isActive: module.isActive,
          actionIds: moduleWithActions.actions?.map((a: { actionId: string }) => a.actionId) || [],
        });
        setIsDialogOpen(true);
      } else {
        // Fallback to module without actions
        setEditingModule(module);
        setFormData({
          slug: module.slug,
          name: module.name,
          description: module.description || "",
          icon: module.icon || "",
          isActive: module.isActive,
          actionIds: [],
        });
        setIsDialogOpen(true);
      }
    } catch (error) {
      console.error("Error fetching module:", error);
      // Fallback to module without actions
      setEditingModule(module);
      setFormData({
        slug: module.slug,
        name: module.name,
        description: module.description || "",
        icon: module.icon || "",
        isActive: module.isActive,
        actionIds: [],
      });
      setIsDialogOpen(true);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      try {
        if (editingModule) {
          // Update module
          await updateModuleAction(editingModule.id, formData, projectId);
          // Update actions separately
          await setModuleActionsAction(
            editingModule.id,
            formData.actionIds,
            projectId,
          );
          toast.success("Module updated");
        } else {
          // Create module
          const { module } = await createModuleAction(
            {
              slug: formData.slug,
              name: formData.name,
              description: formData.description || undefined,
              icon: formData.icon || undefined,
              isActive: formData.isActive,
            },
            projectId,
          );
          // Set actions
          if (formData.actionIds.length > 0) {
            await setModuleActionsAction(module.id, formData.actionIds, projectId);
          }
          toast.success("Module created");
        }

        setIsDialogOpen(false);
        setEditingModule(null);
        setFormData({
          slug: "",
          name: "",
          description: "",
          icon: "",
          isActive: true,
          actionIds: [],
        });
        router.refresh();
      } catch (error) {
        console.error("Error saving module:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to save module",
        );
      }
    });
  }

  async function handleDelete(moduleId: string) {
    if (!confirm("Are you sure you want to delete this module?")) return;

    startTransition(async () => {
      try {
        await deleteModuleAction(moduleId, projectId);
        toast.success("Module deleted");
        router.refresh();
      } catch (error) {
        console.error("Error deleting module:", error);
        toast.error("Failed to delete module");
      }
    });
  }

  function handleOpenDialog() {
    setEditingModule(null);
    setFormData({
      slug: "",
      name: "",
      description: "",
      icon: "",
      isActive: true,
      actionIds: [],
    });
    setIsDialogOpen(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <ModulesHeader onAddClick={handleOpenDialog} />
      <ModulesTable
        modules={modules}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <ModuleDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingModule={editingModule}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
        isPending={isPending}
        availableActions={availableActions}
      />
    </div>
  );
}





