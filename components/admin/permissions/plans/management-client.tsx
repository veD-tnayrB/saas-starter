"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPlanAction, updatePlanAction } from "@/actions/permissions";
import { toast } from "sonner";

import { PlanDialog } from "./dialog";
import { PlansHeader } from "./header";
import { PlansTable } from "./table";

interface ISubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  stripePriceIdMonthly: string | null;
  stripePriceIdYearly: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IPlansManagementClientProps {
  initialPlans: ISubscriptionPlan[];
}

export function PlansManagementClient({
  initialPlans,
}: IPlansManagementClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [plans] = useState<ISubscriptionPlan[]>(initialPlans);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ISubscriptionPlan | null>(
    null,
  );
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    description: "",
    stripePriceIdMonthly: "",
    stripePriceIdYearly: "",
    isActive: true,
  });

  function handleEdit(plan: ISubscriptionPlan) {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      displayName: plan.displayName,
      description: plan.description || "",
      stripePriceIdMonthly: plan.stripePriceIdMonthly || "",
      stripePriceIdYearly: plan.stripePriceIdYearly || "",
      isActive: plan.isActive,
    });
    setIsDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      try {
        const data = {
          ...formData,
          stripePriceIdMonthly: formData.stripePriceIdMonthly || undefined,
          stripePriceIdYearly: formData.stripePriceIdYearly || undefined,
        };

        if (editingPlan) {
          await updatePlanAction(editingPlan.id, data);
          toast.success("Plan updated");
        } else {
          await createPlanAction(data);
          toast.success("Plan created");
        }

        setIsDialogOpen(false);
        setEditingPlan(null);
        setFormData({
          name: "",
          displayName: "",
          description: "",
          stripePriceIdMonthly: "",
          stripePriceIdYearly: "",
          isActive: true,
        });
        router.refresh();
      } catch (error) {
        console.error("Error saving plan:", error);
        toast.error("Failed to save plan");
      }
    });
  }

  function handleOpenDialog() {
    setEditingPlan(null);
    setFormData({
      name: "",
      displayName: "",
      description: "",
      stripePriceIdMonthly: "",
      stripePriceIdYearly: "",
      isActive: true,
    });
    setIsDialogOpen(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <PlansHeader onAddClick={handleOpenDialog} />
      <PlansTable plans={plans} onEdit={handleEdit} />
      <PlanDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingPlan={editingPlan}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
        isPending={isPending}
      />
    </div>
  );
}


