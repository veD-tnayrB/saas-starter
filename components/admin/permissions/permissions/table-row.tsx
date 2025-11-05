"use client";

import { Checkbox } from "@/components/ui/checkbox";

interface IRole {
  id: string;
  name: string;
  priority: number;
}

interface IAction {
  id: string;
  slug: string;
  name: string;
  category: string;
}

interface IPermissionsTableRowProps {
  action: IAction;
  roles: IRole[];
  selectedPlan: string;
  getPermission: (roleId: string, actionId: string) => boolean;
  onTogglePermission: (
    roleId: string,
    actionId: string,
    currentAllowed: boolean,
  ) => void;
  isLoading: boolean;
}

export function PermissionsTableRow({
  action,
  roles,
  selectedPlan,
  getPermission,
  onTogglePermission,
  isLoading,
}: IPermissionsTableRowProps) {
  const roleCells: React.ReactElement[] = [];

  for (const role of roles) {
    const allowed = getPermission(role.id, action.id);
    roleCells.push(
      <td key={role.id} className="p-2 text-center">
        <Checkbox
          checked={allowed}
          onCheckedChange={() =>
            onTogglePermission(role.id, action.id, allowed)
          }
          disabled={isLoading}
        />
      </td>,
    );
  }

  return (
    <tr className="border-b">
      <td className="p-2">
        <div className="font-medium">{action.name}</div>
        <div className="font-mono text-xs text-muted-foreground">
          {action.slug}
        </div>
      </td>
      {roleCells}
    </tr>
  );
}
