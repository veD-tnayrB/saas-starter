"use client";

import { TableCell, TableRow } from "@/components/ui/table";

export function ModulesTableEmpty() {
  return (
    <TableRow>
      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
        No modules found. Create your first module to get started.
      </TableCell>
    </TableRow>
  );
}





