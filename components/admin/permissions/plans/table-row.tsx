"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Icons } from "@/components/shared/icons";

interface ISubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  stripePriceIdMonthly: string | null;
  stripePriceIdYearly: string | null;
  isActive: boolean;
}

interface IPlansTableRowProps {
  plan: ISubscriptionPlan;
  onEdit: (plan: ISubscriptionPlan) => void;
}

export function PlansTableRow({ plan, onEdit }: IPlansTableRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">{plan.name}</TableCell>
      <TableCell>{plan.displayName}</TableCell>
      <TableCell>
        <Badge variant={plan.isActive ? "default" : "secondary"}>
          {plan.isActive ? "Active" : "Inactive"}
        </Badge>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        <div>Monthly: {plan.stripePriceIdMonthly || "-"}</div>
        <div>Yearly: {plan.stripePriceIdYearly || "-"}</div>
      </TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="sm" onClick={() => onEdit(plan)}>
          <Icons.edit className="size-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}


