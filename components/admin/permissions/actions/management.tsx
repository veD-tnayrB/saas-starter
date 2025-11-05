import { getActions } from "@/actions/permissions";

import { ActionsManagementClient } from "./management-client";

export async function ActionsManagement() {
  const { actions } = await getActions();

  return <ActionsManagementClient initialActions={actions} />;
}


