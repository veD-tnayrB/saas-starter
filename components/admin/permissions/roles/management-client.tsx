"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createRoleAction,
  deleteRoleAction,
  updateRoleAction,
} from "@/actions/permissions";
import { toast } from "sonner";

import { RoleDialog } from "./dialog";
import { RolesHeader } from "./header";
import { RolesTable } from "./table";

interface IAppRole {
  id: string;
  name: string;
  priority: number;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface IRolesManagementClientProps {
  initialRoles: IAppRole[];
}

export function RolesManagementClient({
  initialRoles,
}: IRolesManagementClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [roles, setRoles] = useState<IAppRole[]>(initialRoles);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<IAppRole | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    priority: 0,
    description: "",
  });

  function handleEdit(role: IAppRole) {
    setEditingRole(role);
    setFormData({
      name: role.name,
      priority: role.priority,
      description: role.description || "",
    });
    setIsDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      try {
        if (editingRole) {
          await updateRoleAction(editingRole.id, formData);
          toast.success("Role updated");
        } else {
          await createRoleAction(formData);
          toast.success("Role created");
        }

        setIsDialogOpen(false);
        setEditingRole(null);
        setFormData({ name: "", priority: 0, description: "" });
        router.refresh();
      } catch (error) {
        console.error("Error saving role:", error);
        toast.error("Failed to save role");
      }
    });
  }

  async function handleDelete(roleId: string) {
    if (!confirm("Are you sure you want to delete this role?")) return;

    startTransition(async () => {
      try {
        await deleteRoleAction(roleId);
        toast.success("Role deleted");
        router.refresh();
      } catch (error) {
        console.error("Error deleting role:", error);
        toast.error("Failed to delete role");
      }
    });
  }

  function handleOpenDialog() {
    setEditingRole(null);
    setFormData({ name: "", priority: 0, description: "" });
    setIsDialogOpen(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <RolesHeader onAddClick={handleOpenDialog} />
      <RolesTable roles={roles} onEdit={handleEdit} onDelete={handleDelete} />
      <RoleDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingRole={editingRole}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
        isPending={isPending}
      />
    </div>
  );
}


