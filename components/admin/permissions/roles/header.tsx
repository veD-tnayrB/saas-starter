"use client";

import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";

interface IRolesHeaderProps {
  onAddClick: () => void;
}

export function RolesHeader({ onAddClick }: IRolesHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-semibold">Roles</h2>
      <Button onClick={onAddClick}>
        <Icons.add className="mr-2 size-4" />
        Add Role
      </Button>
    </div>
  );
}


