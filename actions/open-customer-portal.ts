"use server";

import { redirect } from "next/navigation";
import NextAuth from "@/auth";
import { billingService } from "@/services/billing";
import type { Session } from "next-auth";
import { getServerSession } from "next-auth";

import { absoluteUrl } from "@/lib/utils";

export type responseAction = {
  status: "success" | "error";
  stripeUrl?: string;
};

const billingUrl = absoluteUrl("/dashboard/billing");

/**
 * Open Stripe customer portal for billing management
 * @param userStripeId - User's Stripe customer ID
 * @returns Redirects to Stripe billing portal
 */
export async function openCustomerPortal(
  userStripeId: string,
): Promise<responseAction> {
  try {
    const session: Session | null = await getServerSession(NextAuth);

    if (!session?.user || !session?.user.email) {
      throw new Error("Unauthorized");
    }

    if (!userStripeId) {
      throw new Error("User Stripe ID is required");
    }

    // Use billing service to handle the operation
    const result = await billingService.createBillingPortalSession({
      userId: session.user.id,
      userEmail: session.user.email,
      stripeCustomerId: userStripeId,
    });

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
