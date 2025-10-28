"use server";

import { redirect } from "next/navigation";
import NextAuth from "@/auth";
import { getServerSession } from "next-auth";

import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

export type responseAction = {
  status: "success" | "error";
  stripeUrl?: string;
};

const billingUrl = absoluteUrl("/dashboard/billing");

export async function openCustomerPortal(
  userStripeId: string,
): Promise<responseAction> {
  let redirectUrl: string = "";

  try {
    const session = await getServerSession(NextAuth);

    if (!session?.user || !session?.user.email) {
      throw new Error("Unauthorized");
    }

    if (userStripeId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: userStripeId,
        return_url: billingUrl,
      });

      redirectUrl = stripeSession.url as string;
    }
  } catch (error) {
    console.error("Error in openCustomerPortal:", error);
    throw new Error(
      `Failed to generate user stripe session: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }

  redirect(redirectUrl);
}
