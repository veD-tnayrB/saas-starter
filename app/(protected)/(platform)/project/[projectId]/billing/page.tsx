import { redirect } from "next/navigation";
import { getCurrentUser } from "@/repositories/auth/session";
import { memberService } from "@/services/projects";
import { getProjectSubscriptionPlan } from "@/services/subscriptions";

import { constructMetadata } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DashboardHeader } from "@/components/dashboard/header";
import { ProjectBilling } from "@/components/dashboard/project-billing";
import { BillingInfo } from "@/components/pricing/billing-info";
import { Icons } from "@/components/shared/icons";

interface BillingPageProps {
  params: Promise<{ projectId: string }>;
}

export const metadata = constructMetadata({
  title: "Billing – SaaS Starter",
  description: "Manage billing and your subscription plan.",
});

export default async function BillingPage({ params }: BillingPageProps) {
  const user = await getCurrentUser();

  if (!user || !user.id) {
    redirect("/login");
  }

  const { projectId } = await params;

  // Verify user is OWNER of the project
  const userRole = await memberService.getUserRole(projectId, user.id);
  if (userRole !== "OWNER") {
    redirect(`/project/${projectId}/dashboard`);
  }

  const userSubscriptionPlan = await getProjectSubscriptionPlan(
    projectId,
    user.id,
  );

  return (
    <>
      <DashboardHeader
        heading="Billing"
        text="Manage billing and your subscription plan."
      />
      <div className="grid gap-8">
        <Alert className="!pl-14">
          <Icons.warning />
          <AlertTitle>This is a demo app.</AlertTitle>
          <AlertDescription className="text-balance">
            SaaS Starter app is a demo app using a Stripe test environment. You
            can find a list of test card numbers on the{" "}
            <a
              href="https://stripe.com/docs/testing#cards"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-8"
            >
              Stripe docs
            </a>
            .
          </AlertDescription>
        </Alert>
        <div className="grid gap-4">
          <h2 className="text-xl font-bold">Available Plans</h2>
          <ProjectBilling
            projectId={projectId}
            currentPlanId={userSubscriptionPlan.id}
          />
        </div>
        <BillingInfo
          userSubscriptionPlan={userSubscriptionPlan}
          projectId={projectId}
        />
      </div>
    </>
  );
}
