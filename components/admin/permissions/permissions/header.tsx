"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface IPlan {
  id: string;
  name: string;
  displayName: string;
}

interface IPermissionsHeaderProps {
  plans: IPlan[];
  selectedPlan: string;
  onPlanChange: (planId: string) => void;
}

export function PermissionsHeader({
  plans,
  selectedPlan,
  onPlanChange,
}: IPermissionsHeaderProps) {
  const planItems: React.ReactElement[] = [];

  for (const plan of plans) {
    planItems.push(
      <SelectItem key={plan.id} value={plan.id}>
        {plan.displayName}
      </SelectItem>,
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-semibold">Permissions Matrix</h2>
        <p className="text-sm text-muted-foreground">
          Configure what each role can do in each plan
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Select value={selectedPlan} onValueChange={onPlanChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a plan" />
          </SelectTrigger>
          <SelectContent>{planItems}</SelectContent>
        </Select>
      </div>
    </div>
  );
}
