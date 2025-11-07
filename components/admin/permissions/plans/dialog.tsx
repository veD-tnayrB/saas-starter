"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface ISubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  stripePriceIdMonthly: string | null;
  stripePriceIdYearly: string | null;
  isActive: boolean;
}

interface IPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPlan: ISubscriptionPlan | null;
  formData: {
    name: string;
    displayName: string;
    description: string;
    stripePriceIdMonthly: string;
    stripePriceIdYearly: string;
    isActive: boolean;
  };
  onFormDataChange: (data: {
    name: string;
    displayName: string;
    description: string;
    stripePriceIdMonthly: string;
    stripePriceIdYearly: string;
    isActive: boolean;
  }) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
}

export function PlanDialog({
  open,
  onOpenChange,
  editingPlan,
  formData,
  onFormDataChange,
  onSubmit,
  isPending,
}: IPlanDialogProps) {
  const dialogTitle = editingPlan ? "Edit Plan" : "Create Plan";
  const dialogDescription = editingPlan
    ? "Update the plan details."
    : "Create a new subscription plan.";
  const submitButtonText = editingPlan ? "Update" : "Create";

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    onFormDataChange({ ...formData, name: e.target.value });
  }

  function handleDisplayNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    onFormDataChange({ ...formData, displayName: e.target.value });
  }

  function handleDescriptionChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    onFormDataChange({ ...formData, description: e.target.value });
  }

  function handleMonthlyPriceChange(e: React.ChangeEvent<HTMLInputElement>) {
    onFormDataChange({ ...formData, stripePriceIdMonthly: e.target.value });
  }

  function handleYearlyPriceChange(e: React.ChangeEvent<HTMLInputElement>) {
    onFormDataChange({ ...formData, stripePriceIdYearly: e.target.value });
  }

  function handleActiveChange(checked: boolean) {
    onFormDataChange({ ...formData, isActive: checked });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name (slug)</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleNameChange}
                required
                disabled={!!editingPlan || isPending}
                placeholder="pro"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={handleDisplayNameChange}
                required
                disabled={isPending}
                placeholder="Pro"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={handleDescriptionChange}
              rows={3}
              disabled={isPending}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stripePriceIdMonthly">
                Stripe Price ID (Monthly)
              </Label>
              <Input
                id="stripePriceIdMonthly"
                value={formData.stripePriceIdMonthly}
                onChange={handleMonthlyPriceChange}
                disabled={isPending}
                placeholder="price_xxx"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stripePriceIdYearly">
                Stripe Price ID (Yearly)
              </Label>
              <Input
                id="stripePriceIdYearly"
                value={formData.stripePriceIdYearly}
                onChange={handleYearlyPriceChange}
                disabled={isPending}
                placeholder="price_xxx"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={handleActiveChange}
              disabled={isPending}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {submitButtonText}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
