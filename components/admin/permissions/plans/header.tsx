"use client";

import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";

interface IPlansHeaderProps {
  onAddClick: () => void;
}

export function PlansHeader({ onAddClick }: IPlansHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-semibold">Subscription Plans</h2>
      <Button onClick={onAddClick}>
        <Icons.add className="mr-2 size-4" />
        Add Plan
      </Button>
    </div>
  );
}


