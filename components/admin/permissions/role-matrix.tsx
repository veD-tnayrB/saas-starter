"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateRolePermissionAction } from "@/actions/permissions/permissions";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface IAction {
  id: string;
  slug: string;
  name: string;
  category: string;
}

interface IAppRole {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
}

interface ISubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
}

interface IRolePermission {
  planId: string;
  roleId: string;
  actionId: string;
  allowed: boolean;
}

interface IRoleMatrixProps {
  initialRoles: IAppRole[];
  initialActions: IAction[];
  initialPlans: ISubscriptionPlan[];
  initialPermissions: IRolePermission[]; // Flat list of all permissions for all plans/roles
}

export function RoleMatrix({
  initialRoles,
  initialActions,
  initialPlans,
  initialPermissions,
}: IRoleMatrixProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    initialPlans[0]?.id || "",
  );

  // Map permissions for easy lookup: planId:roleId:actionId -> boolean
  const [permissions, setPermissions] = useState<Record<string, boolean>>(
    () => {
      const map: Record<string, boolean> = {};
      initialPermissions.forEach((p) => {
        map[`${p.planId}:${p.roleId}:${p.actionId}`] = p.allowed;
      });
      return map;
    },
  );

  // Group actions by category
  const actionsByCategory = initialActions.reduce(
    (acc, action) => {
      if (!acc[action.category]) {
        acc[action.category] = [];
      }
      acc[action.category].push(action);
      return acc;
    },
    {} as Record<string, IAction[]>,
  );

  const categories = Object.keys(actionsByCategory).sort();

  async function togglePermission(
    roleId: string,
    actionId: string,
    current: boolean,
  ) {
    if (!selectedPlanId) {
      toast.error("Please select a plan first");
      return;
    }

    const next = !current;

    // Optimistic update
    const key = `${selectedPlanId}:${roleId}:${actionId}`;
    setPermissions((prev) => ({
      ...prev,
      [key]: next,
    }));

    startTransition(async () => {
      try {
        await updateRolePermissionAction({
          planId: selectedPlanId,
          roleId,
          actionId,
          allowed: next,
        });
      } catch (error) {
        console.error(error);
        toast.error("Failed to update permission");
        // Revert
        setPermissions((prev) => ({
          ...prev,
          [key]: current,
        }));
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Configure for Plan:</span>
        <Select
          value={selectedPlanId}
          onValueChange={setSelectedPlanId}
          disabled={isPending}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a plan" />
          </SelectTrigger>
          <SelectContent>
            {initialPlans.map((plan) => (
              <SelectItem key={plan.id} value={plan.id}>
                {plan.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Action</TableHead>
              {initialRoles.map((role) => (
                <TableHead key={role.id} className="text-center">
                  {role.displayName}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <>
                <TableRow key={category} className="bg-muted/50">
                  <TableCell
                    colSpan={initialRoles.length + 1}
                    className="font-semibold capitalize"
                  >
                    {category}
                  </TableCell>
                </TableRow>
                {actionsByCategory[category].map((action) => (
                  <TableRow key={action.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{action.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {action.slug}
                        </span>
                      </div>
                    </TableCell>
                    {initialRoles.map((role) => {
                      const isAllowed =
                        permissions[
                          `${selectedPlanId}:${role.id}:${action.id}`
                        ] ?? false;
                      return (
                        <TableCell
                          key={`${role.id}:${action.id}`}
                          className="p-0 text-center"
                        >
                          <div className="flex h-full w-full justify-center py-4">
                            <Button
                              variant={isAllowed ? "default" : "outline"}
                              size="sm"
                              className={cn(
                                "h-8 w-8 rounded-full p-0",
                                isAllowed
                                  ? "bg-blue-600 hover:bg-blue-700"
                                  : "text-muted-foreground",
                              )}
                              onClick={() =>
                                togglePermission(role.id, action.id, isAllowed)
                              }
                              disabled={isPending || !selectedPlanId}
                            >
                              {isAllowed ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                              <span className="sr-only">
                                Toggle {action.name} for {role.displayName}
                              </span>
                            </Button>
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
