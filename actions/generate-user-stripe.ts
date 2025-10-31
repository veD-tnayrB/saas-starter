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

const billingUrl = absoluteUrl("/pricing");

/**
 * Generate Stripe session for user (checkout or billing portal)
 * @param priceId - Stripe price ID for subscription
 * @returns Redirects to Stripe session
 */
export async function generateUserStripe(
  priceId: string,
): Promise<responseAction> {
  try {
    const session: Session | null = await getServerSession(NextAuth);
    const user = session?.user;

    if (!user || !user.email || !user.id) {
      throw new Error("Unauthorized");
    }

    // Use billing service to handle the operation
    const result = await billingService.generateUserCheckoutSession(
      user.id,
      priceId,
    );

    if (result.status === "error") {
      throw new Error(result.error || "Failed to generate Stripe session");
    }

    // Redirect to Stripe session
    redirect(result.stripeUrl!);
  } catch (error) {
    // Re-throw redirect errors as-is (Next.js uses these internally)
    if (error && typeof error === "object" && "digest" in error) {
      const digest = String(error.digest);
      if (digest.startsWith("NEXT_REDIRECT")) {
        throw error;
      }
    }
    console.error("Error in generateUserStripe:", error);
    throw new Error(
      `Failed to generate user stripe session: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
