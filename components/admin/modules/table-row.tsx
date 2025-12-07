"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Icons } from "@/components/shared/icons";

interface IModule {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  isActive: boolean;
}

interface IModulesTableRowProps {
  module: IModule;
  onEdit: (module: IModule) => void;
  onDelete: (moduleId: string) => void;
}

export function ModulesTableRow({
  module,
  onEdit,
  onDelete,
}: IModulesTableRowProps) {
  return (
    <TableRow>
      <TableCell className="font-mono text-sm">{module.slug}</TableCell>
      <TableCell className="font-medium">{module.name}</TableCell>
      <TableCell>
        {module.icon ? (
          <span className="text-sm">{module.icon}</span>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )}
      </TableCell>
      <TableCell>
        <Badge variant={module.isActive ? "default" : "secondary"}>
          {module.isActive ? "Active" : "Inactive"}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {module.description || "-"}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(module)}>
            <Icons.edit className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(module.id)}>
            <Icons.trash className="size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}





