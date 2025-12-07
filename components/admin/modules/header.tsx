"use client";

import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";

interface IModulesHeaderProps {
  onAddClick: () => void;
}

export function ModulesHeader({ onAddClick }: IModulesHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-semibold">Modules</h2>
      <Button onClick={onAddClick}>
        <Icons.add className="mr-2 size-4" />
        Add Module
      </Button>
    </div>
  );
}





