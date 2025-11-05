"use client";

import { PermissionsTableRow } from "./table-row";

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

interface IPermissionsTableProps {
  actions: IAction[];
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

export function PermissionsTable({
  actions,
  roles,
  selectedPlan,
  getPermission,
  onTogglePermission,
  isLoading,
}: IPermissionsTableProps) {
  const rows: React.ReactElement[] = [];

  for (const action of actions) {
    rows.push(
      <PermissionsTableRow
        key={action.id}
        action={action}
        roles={roles}
        selectedPlan={selectedPlan}
        getPermission={getPermission}
        onTogglePermission={onTogglePermission}
        isLoading={isLoading}
      />,
    );
  }

  const roleHeaders: React.ReactElement[] = [];
  for (const role of roles) {
    roleHeaders.push(
      <th key={role.id} className="p-2 text-center">
        {role.name}
      </th>,
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-left">Action</th>
            {roleHeaders}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}
