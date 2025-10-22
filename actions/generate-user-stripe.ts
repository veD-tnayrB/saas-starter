"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  createBillingPortalSession,
  createCheckoutSession,
} from "@/clients/stripe";
import { getUserSubscriptionPlan } from "@/services/subscriptions";

import { absoluteUrl } from "@/lib/utils";

export type responseAction = {
  status: "success" | "error";
  stripeUrl?: string;
};

// const billingUrl = absoluteUrl("/dashboard/billing")
const billingUrl = absoluteUrl("/pricing");

export async function generateUserStripe(
  priceId: string,
): Promise<responseAction> {
  let redirectUrl: string = "";

  try {
    const session = await auth();
    const user = session?.user;

    if (!user || !user.email || !user.id) {
      throw new Error("Unauthorized");
    }

    const subscriptionPlan = await getUserSubscriptionPlan(user.id);

    if (subscriptionPlan.isPaid && subscriptionPlan.stripeCustomerId) {
      // User on Paid Plan - Create a portal session to manage subscription.
      const stripeSession = await createBillingPortalSession(
        subscriptionPlan.stripeCustomerId,
        billingUrl,
      );

      redirectUrl = stripeSession.url as string;
    } else {
      // User on Free Plan - Create a checkout session to upgrade.
      const stripeSession = await createCheckoutSession({
        priceId,
        customerEmail: user.email,
        successUrl: billingUrl,
        cancelUrl: billingUrl,
        metadata: {
          userId: user.id,
        },
      });

      redirectUrl = stripeSession.url as string;
    }
  } catch (error) {
    throw new Error("Failed to generate user stripe session");
  }

  // no revalidatePath because redirect
  redirect(redirectUrl);
}
