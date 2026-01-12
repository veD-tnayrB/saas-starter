"use client";

import { formatDistanceToNow } from "date-fns";
import { Edit, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface IAction {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  createdAt: Date;
  updatedAt: Date;
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
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {actions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No actions found.
              </TableCell>
            </TableRow>
          ) : (
            actions.map((action) => (
              <TableRow
                key={action.id}
                className="group transition-colors hover:bg-muted/50"
              >
                <TableCell className="font-semibold text-foreground/90">
                  {action.name}
                </TableCell>
                <TableCell className="font-mono text-[10px] text-muted-foreground/70">
                  {action.slug}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="border-primary/20 bg-primary/5 capitalize text-primary"
                  >
                    {action.category}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[300px] truncate text-muted-foreground/80">
                  {action.description || "-"}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground/60">
                  {formatDistanceToNow(new Date(action.createdAt), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 hover:bg-primary/10 hover:text-primary"
                      onClick={() => onEdit(action)}
                    >
                      <Edit className="size-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => onDelete(action.id)}
                    >
                      <Trash2 className="size-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
