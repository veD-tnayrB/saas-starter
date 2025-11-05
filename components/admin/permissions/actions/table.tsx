"use client";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ActionsTableEmpty } from "./table-empty";
import { ActionsTableRow } from "./table-row";

interface IAction {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
}

interface IActionsTableProps {
  actions: IAction[];
  onEdit: (action: IAction) => void;
  onDelete: (actionId: string) => void;
}

export function ActionsTable({
  actions,
  onEdit,
  onDelete,
}: IActionsTableProps) {
  const hasActions = actions.length > 0;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Slug</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hasActions ? (
            <ActionsTableRows
              actions={actions}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ) : (
            <ActionsTableEmpty />
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function ActionsTableRows({
  actions,
  onEdit,
  onDelete,
}: {
  actions: IAction[];
  onEdit: (action: IAction) => void;
  onDelete: (actionId: string) => void;
}) {
  const rows: React.ReactElement[] = [];

  for (const action of actions) {
    rows.push(
      <ActionsTableRow
        key={action.id}
        action={action}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );
  }

  return <>{rows}</>;
}
