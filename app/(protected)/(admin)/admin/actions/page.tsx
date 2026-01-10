import { redirect } from "next/navigation";
import { getActions } from "@/actions/permissions/actions";
import { getCurrentUser } from "@/repositories/auth/session";
import { isSystemAdmin } from "@/services/auth/platform-admin";

import { constructMetadata } from "@/lib/utils";
import { ActionsManagementClient } from "@/components/admin/actions/management-client";

export const metadata = constructMetadata({
  title: "Actions Management",
  description: "Manage system actions and capabilities.",
});

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default async function ActionsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const isAdmin = await isSystemAdmin(user.id);
  if (!isAdmin) redirect("/");

  const { actions } = await getActions();

  return <ActionsManagementClient initialActions={actions} />;
}
