import { retrieveSubscription } from "@/clients/stripe";
import { SubscriptionConfirmationEmail } from "@/emails/subscription-confirmation-email";
import { findUserById } from "@/repositories/auth/user";
import {
  updateSubscriptionPeriod,
  updateSubscriptionPrice,
  updateUserOnSubscriptionCreate,
} from "@/repositories/subscriptions";
import { render } from "@react-email/render";
import { Resend } from "resend";
import Stripe from "stripe";

import { env } from "@/env.mjs";
import {
  ISubscriptionData,
  ISubscriptionServiceResponse,
} from "@/types/subscriptions";
import { siteConfig } from "@/config/site";

import { determinePlanInterval, findPlanByPriceId } from "./helpers";

/**
 * Handle Stripe webhook events
 */
export async function handleWebhookEvent(
  event: Stripe.Event,
): Promise<ISubscriptionServiceResponse> {
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return {
      success: true,
      data: {
        eventType: event.type,
        processed: true,
      },
    };
  } catch (error) {
    console.error("Error handling webhook event:", error);
    return {
      success: false,
      error: "Failed to handle webhook event",
    };
  }
}

/**
 * Send subscription confirmation email
 */
async function sendSubscriptionConfirmationEmail(data: {
  userEmail: string;
  userName: string | null;
  planName: string;
  planPrice: number;
  interval: "month" | "year";
  nextBillingDate: string;
}): Promise<void> {
  try {
    const resend = new Resend(env.RESEND_API_KEY);
    const dashboardUrl = `${env.NEXT_PUBLIC_APP_URL}/project`;
    const billingPortalUrl = `${env.NEXT_PUBLIC_APP_URL}/project`; // Redirects to dashboard if no project specified

    const html = await render(
      SubscriptionConfirmationEmail({
        userName: data.userName || "there",
        planName: data.planName,
        planPrice: data.planPrice,
        interval: data.interval,
        billingPortalUrl,
        dashboardUrl,
        siteName: siteConfig.name,
        nextBillingDate: data.nextBillingDate,
      }) as React.ReactElement,
    );

    const text = `
      Your ${data.planName} subscription to ${siteConfig.name} is now active!

      Hello ${data.userName || "there"},

      Thank you for subscribing to ${siteConfig.name}! Your ${data.planName} plan is now active and you have full access to all premium features.

      Subscription Details:
      - Plan: ${data.planName}
      - Price: $${data.planPrice}${data.interval === "month" ? "/month" : "/year"}
      - Billing: ${data.interval === "month" ? "monthly" : "yearly"}
      - Next billing date: ${data.nextBillingDate}

      Go to Dashboard: ${dashboardUrl}
      Manage Billing: ${billingPortalUrl}

      Need help? Contact our support team at ${siteConfig.mailSupport}

      © ${new Date().getFullYear()} ${siteConfig.name}. All rights reserved.
    `;

    const { error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: data.userEmail,
      subject: `Welcome to ${data.planName} - Your subscription is active!`,
      html,
      text,
    });

    if (error) {
      throw new Error(
        error.message || "Failed to send subscription confirmation email",
      );
    }
  } catch (error) {
    console.error("Error sending subscription confirmation email:", error);
    // Don't throw - email failure shouldn't break the webhook
  }
}

/**
 * Handle checkout session completed event
 */
export async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  try {
    if (!session.subscription || !session.metadata?.userId) {
      throw new Error("Missing subscription or userId in checkout session");
    }

    // Retrieve the subscription details from Stripe
    const subscription = await retrieveSubscription(
      session.subscription as string,
    );

    // Prepare subscription data
    const subscriptionData: ISubscriptionData = {
      subscriptionId: subscription.id,
      customerId: subscription.customer as string,
      priceId: subscription.items.data[0].price.id,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    };

    // Update the user subscription in our database
    await updateUserOnSubscriptionCreate(
      session.metadata.userId,
      subscriptionData,
    );

    // Send confirmation email (non-blocking)
    try {
      const user = await findUserById(session.metadata.userId);
      if (!user || !user.email) {
        console.warn(
          "User not found or email missing, skipping email confirmation",
        );
      } else {
        const plan = findPlanByPriceId(subscriptionData.priceId);
        if (!plan) {
          console.warn(
            "Plan not found for price ID, skipping email confirmation",
          );
        } else {
          const interval = determinePlanInterval(subscriptionData.priceId);
          if (!interval) {
            console.warn(
              "Could not determine plan interval, skipping email confirmation",
            );
          } else {
            const planPrice =
              interval === "month" ? plan.prices.monthly : plan.prices.yearly;
            const nextBillingDate =
              subscriptionData.currentPeriodEnd.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });

            await sendSubscriptionConfirmationEmail({
              userEmail: user.email,
              userName: user.name ?? null,
              planName: plan.title,
              planPrice,
              interval,
              nextBillingDate,
            });
          }
        }
      }
    } catch (emailError) {
      console.error(
        "Failed to send subscription confirmation email:",
        emailError,
      );
      // Don't throw - email failure shouldn't break the webhook
    }
  } catch (error) {
    console.error("Error handling checkout completed:", error);
    throw error;
  }
}

/**
 * Handle payment succeeded event
 */
export async function handlePaymentSucceeded(
  invoice: Stripe.Invoice,
): Promise<void> {
  try {
    // If the billing reason is not subscription_create, it means the customer has updated their subscription
    if (invoice.billing_reason !== "subscription_create") {
      if (!invoice.subscription) {
        throw new Error("Missing subscription in invoice");
      }

      // Retrieve the subscription details from Stripe
      const subscription = await retrieveSubscription(
        invoice.subscription as string,
      );

      // Update the price id and set the new period end
      await updateSubscriptionPrice(
        subscription.id,
        subscription.items.data[0].price.id,
      );
      await updateSubscriptionPeriod(
        subscription.id,
        new Date(subscription.current_period_end * 1000),
      );
    }
  } catch (error) {
    console.error("Error handling payment succeeded:", error);
    throw error;
  }
}
