"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Icons } from "@/components/shared/icons";

interface IAppRole {
  id: string;
  name: string;
  priority: number;
  description: string | null;
}

interface IRolesTableRowProps {
  role: IAppRole;
  onEdit: (role: IAppRole) => void;
  onDelete: (roleId: string) => void;
}

export function RolesTableRow({ role, onEdit, onDelete }: IRolesTableRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">{role.name}</TableCell>
      <TableCell>
        <Badge variant="outline">{role.priority}</Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {role.description || "-"}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(role)}>
            <Icons.edit className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(role.id)}>
            <Icons.trash className="size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}


