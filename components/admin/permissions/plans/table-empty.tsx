"use client";

import { TableCell, TableRow } from "@/components/ui/table";

export function PlansTableEmpty() {
  return (
    <TableRow>
      <TableCell colSpan={5} className="text-center text-muted-foreground">
        No plans found
      </TableCell>
    </TableRow>
  );
}


