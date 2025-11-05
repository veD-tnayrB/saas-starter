import { getRoles } from "@/actions/permissions";

import { RolesManagementClient } from "./management-client";

export async function RolesManagement() {
  const { roles } = await getRoles();

  return <RolesManagementClient initialRoles={roles} />;
}


