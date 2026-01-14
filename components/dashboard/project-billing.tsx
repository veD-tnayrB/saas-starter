"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getActivePlansAction } from "@/actions/projects/get-active-plans";
import { updateProjectPlanAction } from "@/actions/projects/update-project-plan";
import { ISubscriptionPlan } from "@/repositories/permissions/plans";
import { Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProjectBillingProps {
  projectId: string;
  currentPlanId?: string;
}

// Plan features configuration
const PLAN_FEATURES: Record<
  string,
  { name: string; features: string[]; limits: string[] }
> = {
  free: {
    name: "Free",
    features: ["1 team member", "Basic analytics", "Community support"],
    limits: ["No additional members", "Limited features"],
  },
  pro: {
    name: "Pro",
    features: [
      "Up to 10 team members",
      "Advanced analytics",
      "Priority email support",
      "Custom roles",
      "Audit logs",
    ],
    limits: ["10 member limit"],
  },
  business: {
    name: "Business",
    features: [
      "Unlimited team members",
      "Advanced analytics",
      "24/7 priority support",
      "Custom roles",
      "Audit logs",
      "SSO (coming soon)",
      "Advanced security",
    ],
    limits: [],
  },
};

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

  const currentPlan = plans.find((p) => p.id === currentPlanId);

  return (
    <div className="space-y-6">
      {/* Current Plan Summary */}
      {currentPlan && (
        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Plan</p>
              <p className="text-2xl font-bold">{currentPlan.displayName}</p>
            </div>
            {currentPlan.name !== "free" && (
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="size-3" />
                Active
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Plans Comparison */}
      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlanId === plan.id;
          const planConfig = PLAN_FEATURES[plan.name] || {
            name: plan.displayName,
            features: [],
            limits: [],
          };

          return (
            <Card
              key={plan.id}
              className={cn(
                "relative flex flex-col",
                isCurrentPlan && "border-primary shadow-md",
                plan.name === "pro" && "border-primary/50",
              )}
            >
              {plan.name === "pro" && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="gap-1 bg-primary">
                    <Sparkles className="size-3" />
                    Popular
                  </Badge>
                </div>
              )}

              <CardHeader>
                <div className="space-y-1">
                  <CardTitle className="flex items-center justify-between">
                    {plan.displayName}
                    {isCurrentPlan && (
                      <Badge variant="outline" className="ml-2">
                        <Check className="mr-1 size-3" />
                        Current
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="min-h-[40px]">
                    {plan.description}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col gap-4">
                {/* Features */}
                <div className="flex-1 space-y-3">
                  <p className="text-sm font-medium">Features</p>
                  <ul className="space-y-2">
                    {planConfig.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <Button
                  className="w-full"
                  variant={
                    isCurrentPlan
                      ? "outline"
                      : plan.name === "pro"
                        ? "default"
                        : "secondary"
                  }
                  disabled={isPending || isCurrentPlan}
                  onClick={() => onUpdatePlan(plan.id)}
                >
                  {isPending && !isCurrentPlan && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  {isCurrentPlan
                    ? "Current Plan"
                    : plan.name === "free"
                      ? "Downgrade"
                      : "Upgrade"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Note:</strong> Plan changes take effect immediately. You
          can upgrade or downgrade at any time.
        </p>
      </div>
    </div>
  );
}
