"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

interface IActionsHeaderProps {
  onAddClick: () => void;
}

export function ActionsHeader({ onAddClick }: IActionsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-gradient text-3xl font-bold tracking-tight">
          Actions
        </h2>
        <p className="text-muted-foreground">
          Manage system actions and capabilities.
        </p>
      </div>
      <Button onClick={onAddClick} className="hover-lift shadow-silver">
        <Plus className="mr-2 h-4 w-4" />
        Add Action
      </Button>
    </div>
  );
}
