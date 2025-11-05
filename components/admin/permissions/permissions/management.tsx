import { getActions, getPlans, getRoles } from "@/actions/permissions";

import { PermissionsManagementClient } from "./management-client";

export async function PermissionsManagement() {
  const [plansData, rolesData, actionsData] = await Promise.all([
    getPlans(),
    getRoles(),
    getActions(),
  ]);

  return (
    <PermissionsManagementClient
      initialPlans={plansData.plans}
      initialRoles={rolesData.roles}
      initialActions={actionsData.actions}
    />
  );
}


