"use client";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ModulesTableEmpty } from "./table-empty";
import { ModulesTableRow } from "./table-row";

interface IModule {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  isActive: boolean;
}

interface IModulesTableProps {
  modules: IModule[];
  onEdit: (module: IModule) => void;
  onDelete: (moduleId: string) => void;
}

export function ModulesTable({
  modules,
  onEdit,
  onDelete,
}: IModulesTableProps) {
  const hasModules = modules.length > 0;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Slug</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Icon</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hasModules ? (
            <ModulesTableRows
              modules={modules}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ) : (
            <ModulesTableEmpty />
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function ModulesTableRows({
  modules,
  onEdit,
  onDelete,
}: {
  modules: IModule[];
  onEdit: (module: IModule) => void;
  onDelete: (moduleId: string) => void;
}) {
  const rows: React.ReactElement[] = [];

  for (const module of modules) {
    rows.push(
      <ModulesTableRow
        key={module.id}
        module={module}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );
  }

  return <>{rows}</>;
}





