"use client";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { RolesTableEmpty } from "./table-empty";
import { RolesTableRow } from "./table-row";

interface IAppRole {
  id: string;
  name: string;
  priority: number;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface IRolesTableProps {
  roles: IAppRole[];
  onEdit: (role: IAppRole) => void;
  onDelete: (roleId: string) => void;
}

export function RolesTable({ roles, onEdit, onDelete }: IRolesTableProps) {
  const hasRoles = roles.length > 0;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hasRoles ? (
            <RolesTableRows roles={roles} onEdit={onEdit} onDelete={onDelete} />
          ) : (
            <RolesTableEmpty />
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function RolesTableRows({
  roles,
  onEdit,
  onDelete,
}: {
  roles: IAppRole[];
  onEdit: (role: IAppRole) => void;
  onDelete: (roleId: string) => void;
}) {
  const rows: React.ReactElement[] = [];

  for (const role of roles) {
    rows.push(
      <RolesTableRow
        key={role.id}
        role={role}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );
  }

  return <>{rows}</>;
}
