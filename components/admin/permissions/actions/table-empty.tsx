"use client";

import { TableCell, TableRow } from "@/components/ui/table";

export function ActionsTableEmpty() {
  return (
    <TableRow>
      <TableCell colSpan={5} className="text-center text-muted-foreground">
        No actions found
      </TableCell>
    </TableRow>
  );
}


