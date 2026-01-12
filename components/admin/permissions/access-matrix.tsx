"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updatePlanPermissionAction } from "@/actions/permissions/permissions";
import { motion } from "framer-motion";
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
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="glass-card overflow-hidden rounded-xl"
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[300px] font-bold">Action</TableHead>
            {initialPlans.map((plan) => (
              <TableHead key={plan.id} className="text-center font-bold">
                {plan.displayName}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <React.Fragment key={category}>
              <TableRow className="bg-muted/30 transition-colors hover:bg-muted/40">
                <TableCell
                  colSpan={initialPlans.length + 1}
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
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "h-10 w-10 rounded-xl transition-all duration-300",
                              isEnabled
                                ? "bg-primary/10 text-primary shadow-[0_0_15px_hsl(var(--primary)/0.1)] hover:bg-primary/20"
                                : "text-muted-foreground/30 hover:bg-muted/50 hover:text-muted-foreground/60",
                            )}
                            onClick={() =>
                              togglePermission(plan.id, action.id, isEnabled)
                            }
                            disabled={isPending}
                          >
                            {isEnabled ? (
                              <Check className="h-5 w-5" />
                            ) : (
                              <X className="h-5 w-5" />
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
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  );
}
