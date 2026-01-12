import { redirect } from "next/navigation";
import { getCurrentUser } from "@/repositories/auth/session";
import { findAllActions } from "@/repositories/permissions";
import { getPlanActionPermissions } from "@/repositories/permissions/permissions";
import { findAllPlans } from "@/repositories/permissions/plans";
import { isSystemAdmin } from "@/services/auth/platform-admin";

import { constructMetadata } from "@/lib/utils";
import { AccessMatrix } from "@/components/admin/permissions/access-matrix";
import { FramerWrapper } from "@/components/shared/framer-wrapper";

export const metadata = constructMetadata({
  title: "Pricing Plans & Access",
  description: "Configure subscription plans and feature access.",
});

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const isAdmin = await isSystemAdmin(user.id);
  if (!isAdmin) redirect("/");

  // Fetch all necessary data
  const plans = await findAllPlans();
  const actions = await findAllActions();

  // Fetch permissions for all plans
  // optimization: could be a single query, but separate calls are fine for admin page
  const allPermissions: any[] = [];
  for (const plan of plans) {
    const perms = await getPlanActionPermissions(plan.id);
    allPermissions.push(...perms);
  }

  return (
    <FramerWrapper className="flex flex-col gap-8">
      <div>
        <h1 className="text-gradient text-4xl font-extrabold tracking-tight lg:text-5xl">
          Access Control Matrix
        </h1>
        <p className="mt-2 max-w-[750px] text-lg text-muted-foreground">
          Define which actions are available in each subscription plan.
          Configure the core system boundaries.
        </p>
      </div>

      <AccessMatrix
        initialPlans={plans}
        initialActions={actions}
        initialPermissions={allPermissions}
      />
    </FramerWrapper>
  );
}
