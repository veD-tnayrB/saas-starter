"use client";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { PlansTableEmpty } from "./table-empty";
import { PlansTableRow } from "./table-row";

interface ISubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  stripePriceIdMonthly: string | null;
  stripePriceIdYearly: string | null;
  isActive: boolean;
}

interface IPlansTableProps {
  plans: ISubscriptionPlan[];
  onEdit: (plan: ISubscriptionPlan) => void;
}

export function PlansTable({ plans, onEdit }: IPlansTableProps) {
  const hasPlans = plans.length > 0;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Display Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Stripe IDs</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hasPlans ? (
            <PlansTableRows plans={plans} onEdit={onEdit} />
          ) : (
            <PlansTableEmpty />
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function PlansTableRows({
  plans,
  onEdit,
}: {
  plans: ISubscriptionPlan[];
  onEdit: (plan: ISubscriptionPlan) => void;
}) {
  const rows: React.ReactElement[] = [];

  for (const plan of plans) {
    rows.push(<PlansTableRow key={plan.id} plan={plan} onEdit={onEdit} />);
  }

  return <>{rows}</>;
}
