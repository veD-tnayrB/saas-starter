"use client";

import { TableCell, TableRow } from "@/components/ui/table";

export function RolesTableEmpty() {
  return (
    <TableRow>
      <TableCell colSpan={4} className="text-center text-muted-foreground">
        No roles found
      </TableCell>
    </TableRow>
  );
}


