"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProjectPlanAction } from "@/actions/projects/update-project-plan";
import { Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ISubscriptionPlan, IUserSubscriptionPlan } from "@/types";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PLAN_FEATURES } from "@/config/plans";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface ProjectBillingProps {
  projectId: string;
  plans: ISubscriptionPlan[];
  userSubscriptionPlan: IUserSubscriptionPlan;
}

export function ProjectBilling({
  projectId,
  plans,
  userSubscriptionPlan,
}: ProjectBillingProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [planToUpdateId, setPlanToUpdateId] = useState<string | null>(null);

  const currentPlanId = userSubscriptionPlan.id;

  const currentPlanExpirationDate = userSubscriptionPlan.isPaid
    ? userSubscriptionPlan.stripeCurrentPeriodEnd
      ? format(userSubscriptionPlan.stripeCurrentPeriodEnd, "PPP 'at' HH:mm")
      : "an unknown date"
    : null;

  const onUpdatePlan = (planId: string) => {
    if (planId === currentPlanId) return;

    setPlanToUpdateId(planId);
    setShowConfirmDialog(true);
  };

  const handleConfirmUpdatePlan = () => {
    if (!planToUpdateId) return;

    setShowConfirmDialog(false); // Close dialog immediately

    startTransition(async () => {
      const result = await updateProjectPlanAction(projectId, planToUpdateId);
      if (result.status === "success") {
        toast.success("Project plan updated successfully");
        router.refresh();
      } else {
        toast.error(result.message || "Failed to update project plan");
      }
      setPlanToUpdateId(null);
    });
  };

  const currentPlan = plans.find((p) => p.id === currentPlanId);
  const selectedPlanForUpdate = plans.find((p) => p.id === planToUpdateId);

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
                "relative flex flex-col overflow-visible",
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

              <CardHeader className="pt-6">
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

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Plan Change</DialogTitle>
            <DialogDescription>
              {userSubscriptionPlan.isPaid ? (
                <>
                  You are about to change your current plan{" "}
                  <strong>{currentPlan?.displayName}</strong> to{" "}
                  <strong>{selectedPlanForUpdate?.displayName}</strong>.
                  <br />
                  <br />
                  To make the most of your current plan and avoid losing funds,
                  we recommend waiting until your current plan's cut-off date,
                  which is on{" "}
                  <strong>{currentPlanExpirationDate}</strong>.
                  <br />
                  <br />
                  Please note that by changing your plan before this date, you
                  will be charged the full amount of the new plan (
                  <strong>{selectedPlanForUpdate?.displayName}</strong>) in
                  addition to what you have already paid for your current plan.
                  Previous charges are non-refundable.
                  <br />
                  <br />
                  Are you sure you want to proceed with the plan change?
                </>
              ) : (
                <>
                  You are about to upgrade your current plan{" "}
                  <strong>{currentPlan?.displayName}</strong> to{" "}
                  <strong>{selectedPlanForUpdate?.displayName}</strong>.
                  <br />
                  <br />
                  Are you sure you want to proceed with the plan upgrade?
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="default"
              onClick={handleConfirmUpdatePlan}
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
