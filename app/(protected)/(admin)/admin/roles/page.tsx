import { redirect } from "next/navigation";
import { getCurrentUser } from "@/repositories/auth/session";
import { findAllActions } from "@/repositories/permissions";
import { getRoleActionPermissions } from "@/repositories/permissions/permissions";
import { findAllPlans } from "@/repositories/permissions/plans";
import { findAllRoles } from "@/repositories/permissions/roles";
import { isSystemAdmin } from "@/services/auth/platform-admin";

import { constructMetadata } from "@/lib/utils";
import { RoleMatrix } from "@/components/admin/permissions/role-matrix";
import { DashboardHeader } from "@/components/dashboard/header";

export const metadata = constructMetadata({
  title: "Role Permissions",
  description: "Configure role-based access control per plan.",
});

export const dynamic = "force-dynamic";

export default async function RolesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const isAdmin = await isSystemAdmin(user.id);
  if (!isAdmin) redirect("/");

  // Fetch all necessary data
  const roles = await findAllRoles();
  const plans = await findAllPlans();
  const actions = await findAllActions();

  // Fetch ALL role permissions for all plans
  // Optimization: In a huge system, we would lazy load per plan on client.
  // For now, loading all is fine for an admin page.
  const allPermissions = [];
  for (const plan of plans) {
    const perms = await getRoleActionPermissions(plan.id);
    allPermissions.push(...perms);
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        heading="Role Permissions Matrix"
        text="Define what each role can do within the constraints of their subscription plan."
      />

      <RoleMatrix
        initialRoles={roles}
        initialPlans={plans}
        initialActions={actions}
        initialPermissions={allPermissions}
      />
    </div>
  );
}
