"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getActivePlansAction } from "@/actions/projects/get-active-plans";
import { updateProjectPlanAction } from "@/actions/projects/update-project-plan";
import { ISubscriptionPlan } from "@/repositories/permissions/plans";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ProjectBillingProps {
  projectId: string;
  currentPlanId?: string;
}

export function ProjectBilling({
  projectId,
  currentPlanId,
}: ProjectBillingProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [plans, setPlans] = useState<ISubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlans() {
      const response = await getActivePlansAction();
      setPlans(response.plans);
      setLoading(false);
    }
    loadPlans();
  }, []);

  const onUpdatePlan = (planId: string) => {
    if (planId === currentPlanId) return;

    startTransition(async () => {
      const result = await updateProjectPlanAction(projectId, planId);
      if (result.status === "success") {
        toast.success("Project plan updated successfully");
        router.refresh();
      } else {
        toast.error(result.message || "Failed to update project plan");
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={cn(
            "relative flex flex-col items-start gap-4 rounded-2xl border p-6 transition-all",
            currentPlanId === plan.id
              ? "border-primary bg-primary/5 shadow-md"
              : "border-border bg-card hover:border-primary/50",
          )}
        >
          {currentPlanId === plan.id && (
            <div className="absolute right-4 top-4 rounded-full bg-primary p-1 text-primary-foreground">
              <Check className="size-3" />
            </div>
          )}
          <div className="space-y-1">
            <h3 className="font-bold">{plan.displayName}</h3>
            <p className="text-sm text-muted-foreground">{plan.description}</p>
          </div>
          <div className="mt-auto w-full">
            <Button
              className="w-full"
              variant={currentPlanId === plan.id ? "ghost" : "default"}
              disabled={isPending || currentPlanId === plan.id}
              onClick={() => onUpdatePlan(plan.id)}
            >
              {isPending && currentPlanId !== plan.id && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              {currentPlanId === plan.id ? "Current Plan" : "Switch Plan"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
