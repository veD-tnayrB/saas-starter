"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getRolePermissions, updateRolePermissionAction } from "@/actions/permissions";
import { toast } from "sonner";

import { PermissionsEmpty } from "./empty";
import { PermissionsHeader } from "./header";
import { PermissionsMatrix } from "./matrix";

interface IPlan {
  id: string;
  name: string;
  displayName: string;
}

interface IRole {
  id: string;
  name: string;
  priority: number;
}

interface IAction {
  id: string;
  slug: string;
  name: string;
  category: string;
}

interface IPermission {
  planId: string;
  roleId: string;
  actionId: string;
  allowed: boolean;
}

interface IPermissionsManagementClientProps {
  initialPlans: IPlan[];
  initialRoles: IRole[];
  initialActions: IAction[];
}

export function PermissionsManagementClient({
  initialPlans,
  initialRoles,
  initialActions,
}: IPermissionsManagementClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [permissions, setPermissions] = useState<IPermission[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedPlan) {
      loadPermissions();
    }
  }, [selectedPlan]);

  async function loadPermissions() {
    if (!selectedPlan) return;

    setIsLoading(true);
    try {
      const { permissions: perms } = await getRolePermissions(selectedPlan);
      setPermissions(perms);
    } catch (error) {
      console.error("Error loading permissions:", error);
      toast.error("Failed to load permissions");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleTogglePermission(
    roleId: string,
    actionId: string,
    currentAllowed: boolean,
  ) {
    if (!selectedPlan) return;

    const newAllowed = !currentAllowed;

    startTransition(async () => {
      try {
        await updateRolePermissionAction({
          planId: selectedPlan,
          roleId,
          actionId,
          allowed: newAllowed,
        });

        setPermissions((prev) => {
          const existingIndex = prev.findIndex(
            (p) =>
              p.planId === selectedPlan &&
              p.roleId === roleId &&
              p.actionId === actionId,
          );

          if (existingIndex > -1) {
            const updated = [...prev];
            updated[existingIndex] = {
              ...updated[existingIndex],
              allowed: newAllowed,
            };
            return updated;
          }

          return [
            ...prev,
            {
              planId: selectedPlan,
              roleId,
              actionId,
              allowed: newAllowed,
            },
          ];
        });

        toast.success("Permission updated");
        router.refresh();
      } catch (error) {
        console.error("Error updating permission:", error);
        toast.error("Failed to update permission");
      }
    });
  }

  function getPermission(roleId: string, actionId: string): boolean {
    const permission = permissions.find(
      (p) =>
        p.planId === selectedPlan &&
        p.roleId === roleId &&
        p.actionId === actionId,
    );
    return permission?.allowed ?? false;
  }

  const sortedRoles = [...initialRoles].sort((a, b) => a.priority - b.priority);

  return (
    <div className="flex flex-col gap-4">
      <PermissionsHeader
        plans={initialPlans}
        selectedPlan={selectedPlan}
        onPlanChange={setSelectedPlan}
      />
      {!selectedPlan ? (
        <PermissionsEmpty />
      ) : (
        <PermissionsMatrix
          roles={sortedRoles}
          actions={initialActions}
          selectedPlan={selectedPlan}
          getPermission={getPermission}
          onTogglePermission={handleTogglePermission}
          isLoading={isLoading || isPending}
        />
      )}
    </div>
  );
}


