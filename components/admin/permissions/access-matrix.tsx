"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updatePlanPermissionAction } from "@/actions/permissions/permissions";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

interface ISubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  isActive: boolean;
}

interface IPermission {
  planId: string;
  actionId: string;
  enabled: boolean;
}

interface IAccessMatrixProps {
  initialPlans: ISubscriptionPlan[];
  initialActions: IAction[];
  initialPermissions: IPermission[];
}

export function AccessMatrix({
  initialPlans,
  initialActions,
  initialPermissions,
}: IAccessMatrixProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [permissions, setPermissions] = useState<Record<string, boolean>>(
    () => {
      const map: Record<string, boolean> = {};
      initialPermissions.forEach((p) => {
        map[`${p.planId}:${p.actionId}`] = p.enabled;
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
    planId: string,
    actionId: string,
    current: boolean,
  ) {
    const next = !current;

    // Optimistic update
    setPermissions((prev) => ({
      ...prev,
      [`${planId}:${actionId}`]: next,
    }));

    startTransition(async () => {
      try {
        await updatePlanPermissionAction({ planId, actionId, enabled: next });
        // toast.success("Permission updated"); // Too noisy for a matrix
      } catch (error) {
        console.error(error);
        toast.error("Failed to update permission");
        // Revert
        setPermissions((prev) => ({
          ...prev,
          [`${planId}:${actionId}`]: current,
        }));
      }
    });
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Action</TableHead>
            {initialPlans.map((plan) => (
              <TableHead key={plan.id} className="text-center">
                {plan.displayName}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <>
              <TableRow key={category} className="bg-muted/50">
                <TableCell
                  colSpan={initialPlans.length + 1}
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
                  {initialPlans.map((plan) => {
                    const isEnabled =
                      permissions[`${plan.id}:${action.id}`] ?? false;
                    return (
                      <TableCell
                        key={`${plan.id}:${action.id}`}
                        className="p-0 text-center"
                      >
                        <div className="flex h-full w-full justify-center py-4">
                          <Button
                            variant={isEnabled ? "default" : "outline"}
                            size="sm"
                            className={cn(
                              "h-8 w-8 rounded-full p-0",
                              isEnabled
                                ? "bg-green-600 hover:bg-green-700"
                                : "text-muted-foreground",
                            )}
                            onClick={() =>
                              togglePermission(plan.id, action.id, isEnabled)
                            }
                            disabled={isPending}
                          >
                            {isEnabled ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                              Toggle {action.name} for {plan.displayName}
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
  );
}
