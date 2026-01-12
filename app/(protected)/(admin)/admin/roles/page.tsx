import { redirect } from "next/navigation";
import { getCurrentUser } from "@/repositories/auth/session";
import { findAllActions } from "@/repositories/permissions";
import { getRoleActionPermissions } from "@/repositories/permissions/permissions";
import { findAllPlans } from "@/repositories/permissions/plans";
import { findAllRoles } from "@/repositories/permissions/roles";
import { isSystemAdmin } from "@/services/auth/platform-admin";

import { constructMetadata } from "@/lib/utils";
import { RoleMatrix } from "@/components/admin/permissions/role-matrix";
import { FramerWrapper } from "@/components/shared/framer-wrapper";

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
  const allPermissions: any[] = [];
  for (const plan of plans) {
    const perms = await getRoleActionPermissions(plan.id);
    allPermissions.push(...perms);
  }

  return (
    <FramerWrapper className="flex flex-col gap-8">
      <div>
        <h1 className="text-gradient text-4xl font-extrabold tracking-tight lg:text-5xl">
          Role Permissions Matrix
        </h1>
        <p className="mt-2 max-w-[750px] text-lg text-muted-foreground">
          Define what each role can do within the constraints of their
          subscription plan.
        </p>
      </div>

      <RoleMatrix
        initialRoles={roles}
        initialPlans={plans}
        initialActions={actions}
        initialPermissions={allPermissions}
      />
    </FramerWrapper>
  );
}
