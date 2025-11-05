"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Icons } from "@/components/shared/icons";

interface IAction {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
}

interface IActionsTableRowProps {
  action: IAction;
  onEdit: (action: IAction) => void;
  onDelete: (actionId: string) => void;
}

export function ActionsTableRow({
  action,
  onEdit,
  onDelete,
}: IActionsTableRowProps) {
  return (
    <TableRow>
      <TableCell className="font-mono text-sm">{action.slug}</TableCell>
      <TableCell className="font-medium">{action.name}</TableCell>
      <TableCell>
        <Badge variant="outline">{action.category}</Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {action.description || "-"}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(action)}>
            <Icons.edit className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(action.id)}>
            <Icons.trash className="size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}


