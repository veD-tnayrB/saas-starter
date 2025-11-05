"use client";

import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";

interface IActionsHeaderProps {
  onAddClick: () => void;
}

export function ActionsHeader({ onAddClick }: IActionsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-semibold">Actions</h2>
      <Button onClick={onAddClick}>
        <Icons.add className="mr-2 size-4" />
        Add Action
      </Button>
    </div>
  );
}


