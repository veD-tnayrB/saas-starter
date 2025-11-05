import { getPlans } from "@/actions/permissions";

import { PlansManagementClient } from "./management-client";

export async function PlansManagement() {
  const { plans } = await getPlans();

  return <PlansManagementClient initialPlans={plans} />;
}


