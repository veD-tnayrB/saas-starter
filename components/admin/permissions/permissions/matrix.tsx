"use client";

import { PermissionsCategoryCard } from "./category-card";

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

interface IPermissionsMatrixProps {
  roles: IRole[];
  actions: IAction[];
  selectedPlan: string;
  getPermission: (roleId: string, actionId: string) => boolean;
  onTogglePermission: (
    roleId: string,
    actionId: string,
    currentAllowed: boolean,
  ) => void;
  isLoading: boolean;
}

export function PermissionsMatrix({
  roles,
  actions,
  selectedPlan,
  getPermission,
  onTogglePermission,
  isLoading,
}: IPermissionsMatrixProps) {
  const actionsByCategory: Record<string, IAction[]> = {};

  for (const action of actions) {
    if (!actionsByCategory[action.category]) {
      actionsByCategory[action.category] = [];
    }
    actionsByCategory[action.category].push(action);
  }

  const categoryCards: React.ReactElement[] = [];
  const categories = Object.keys(actionsByCategory);

  for (const category of categories) {
    const categoryActions = actionsByCategory[category];
    categoryCards.push(
      <PermissionsCategoryCard
        key={category}
        category={category}
        actions={categoryActions}
        roles={roles}
        selectedPlan={selectedPlan}
        getPermission={getPermission}
        onTogglePermission={onTogglePermission}
        isLoading={isLoading}
      />,
    );
  }

  return <div className="space-y-6">{categoryCards}</div>;
}
