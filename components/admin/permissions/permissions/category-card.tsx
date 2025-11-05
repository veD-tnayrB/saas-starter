"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { PermissionsTable } from "./table";

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

interface IPermissionsCategoryCardProps {
  category: string;
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

export function PermissionsCategoryCard({
  category,
  actions,
  roles,
  selectedPlan,
  getPermission,
  onTogglePermission,
  isLoading,
}: IPermissionsCategoryCardProps) {
  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="capitalize">{categoryTitle}</CardTitle>
        <CardDescription>Permissions for {category} actions</CardDescription>
      </CardHeader>
      <CardContent>
        <PermissionsTable
          actions={actions}
          roles={roles}
          selectedPlan={selectedPlan}
          getPermission={getPermission}
          onTogglePermission={onTogglePermission}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}


