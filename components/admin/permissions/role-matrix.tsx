"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateRolePermissionAction } from "@/actions/permissions/permissions";
import { motion } from "framer-motion";
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
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass flex w-fit items-center gap-4 rounded-xl border-primary/10 px-4 py-2 shadow-sm"
      >
        <span className="text-sm font-semibold text-muted-foreground">
          Configure for Plan:
        </span>
        <Select
          value={selectedPlanId}
          onValueChange={setSelectedPlanId}
          disabled={isPending}
        >
          <SelectTrigger className="w-[200px] border-none bg-transparent hover:bg-primary/5 focus:ring-0">
            <SelectValue placeholder="Select a plan" />
          </SelectTrigger>
          <SelectContent className="glass-card">
            {initialPlans.map((plan) => (
              <SelectItem
                key={plan.id}
                value={plan.id}
                className="focus:bg-primary/10"
              >
                {plan.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="glass-card overflow-hidden rounded-xl"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Action</TableHead>
              {initialRoles.map((role) => (
                <TableHead
                  key={role.id}
                  className="text-center font-bold capitalize"
                >
                  {role.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <React.Fragment key={category}>
                <TableRow className="bg-muted/30 transition-colors hover:bg-muted/40">
                  <TableCell
                    colSpan={initialRoles.length + 1}
                    className="py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground/70"
                  >
                    {category}
                  </TableCell>
                </TableRow>
                {actionsByCategory[category].map((action) => (
                  <TableRow
                    key={action.id}
                    className="group transition-colors hover:bg-muted/20"
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground/90">
                          {action.name}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground/60">
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
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "h-10 w-10 rounded-xl transition-all duration-300",
                                isAllowed
                                  ? "bg-primary/10 text-primary shadow-[0_0_15px_hsl(var(--primary)/0.1)] hover:bg-primary/20"
                                  : "text-muted-foreground/30 hover:bg-muted/50 hover:text-muted-foreground/60",
                              )}
                              onClick={() =>
                                togglePermission(role.id, action.id, isAllowed)
                              }
                              disabled={isPending || !selectedPlanId}
                            >
                              {isAllowed ? (
                                <Check className="h-5 w-5" />
                              ) : (
                                <X className="h-5 w-5" />
                              )}
                              <span className="sr-only">
                                Toggle {action.name} for {role.name}
                              </span>
                            </Button>
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}
