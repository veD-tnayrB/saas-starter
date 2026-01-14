"use server";

import { redirect } from "next/navigation";
import { billingService } from "@/services/billing";

import { getCurrentUser } from "@/lib/session";
import { absoluteUrl } from "@/lib/utils";

export type responseAction = {
  status: "success" | "error";
  stripeUrl?: string;
};

export async function openCustomerPortal(
  userStripeId: string,
  projectId?: string,
): Promise<responseAction> {
  try {
    const user = await getCurrentUser();

    if (!user || !user.email) {
      throw new Error("Unauthorized");
    }

    if (!userStripeId) {
      throw new Error("User Stripe ID is required");
    }

    const returnUrl = projectId
      ? absoluteUrl(`/project/${projectId}/settings`)
      : absoluteUrl("/project");

    // Use billing service to handle the operation
    const result = await billingService.createBillingPortalSession(
      userStripeId,
      returnUrl,
    );

    if (result.status === "error") {
      throw new Error(
        result.error || "Failed to create billing portal session",
      );
    }

    // Redirect to Stripe billing portal
    redirect(result.stripeUrl!);
  } catch (error) {
    // Re-throw redirect errors as-is (Next.js uses these internally)
    if (error && typeof error === "object" && "digest" in error) {
      const digest = String(error.digest);
      if (digest.startsWith("NEXT_REDIRECT")) {
        throw error;
      }
    }
    console.error("Error in openCustomerPortal:", error);
    throw new Error(
      `Failed to open customer portal: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
