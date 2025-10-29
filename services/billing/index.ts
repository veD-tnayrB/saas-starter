import { findUserById } from "@/repositories/auth";
import { getUserSubscriptionPlan } from "@/services/subscriptions";
import Stripe from "stripe";

import type { IAuthUser } from "@/types/auth";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

/**
 * Create Stripe checkout session
 */
async function createCheckoutSession(
  data: CheckoutSessionData,
): Promise<Stripe.Checkout.Session> {
  try {
    const session = await stripe.checkout.sessions.create({
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: data.userEmail,
      line_items: [
        {
          price: data.priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: data.userId,
      },
    });

    return session;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw new Error("Failed to create checkout session");
  }
}

/**
 * Create Stripe billing portal session
 */
async function createBillingPortalSession(
  customerId: string,
  returnUrl: string,
): Promise<Stripe.BillingPortal.Session> {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session;
  } catch (error) {
    console.error("Error creating billing portal session:", error);
    throw new Error("Failed to create billing portal session");
  }
}

/**
 * Billing operation result
 */
export interface BillingResult {
  status: "success" | "error";
  stripeUrl?: string;
  error?: string;
}

/**
 * Checkout session data
 */
export interface CheckoutSessionData {
  priceId: string;
  userId: string;
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
}

/**
 * Billing portal session data
 */
export interface BillingPortalData {
  userId: string;
  userEmail: string;
  stripeCustomerId: string;
}

/**
 * Main billing service that handles Stripe operations
 */
export class BillingService {
  /**
   * Create a Stripe checkout session for subscription
   * @param data - Checkout session data
   * @returns Billing result with Stripe URL
   */
  async createCheckoutSession(
    data: CheckoutSessionData,
  ): Promise<BillingResult> {
    try {
      const { priceId, userId, userEmail } = data;

      // Create checkout session via Stripe client
      const checkoutSession = await createCheckoutSession({
        priceId,
        userId,
        userEmail,
        successUrl: data.successUrl,
        cancelUrl: data.cancelUrl,
      });

      if (!checkoutSession.url) {
        throw new Error("Failed to create checkout session");
      }

      return {
        status: "success",
        stripeUrl: checkoutSession.url,
      };
    } catch (error) {
      console.error("Error creating checkout session:", error);
      return {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Create a Stripe billing portal session
   * @param data - Billing portal data
   * @returns Billing result with Stripe URL
   */
  async createBillingPortalSession(
    data: BillingPortalData,
  ): Promise<BillingResult> {
    try {
      const { userId, userEmail, stripeCustomerId } = data;

      // Create billing portal session via Stripe client
      const portalSession = await createBillingPortalSession(
        stripeCustomerId,
        absoluteUrl("/dashboard/billing"),
      );

      if (!portalSession.url) {
        throw new Error("Failed to create billing portal session");
      }

      return {
        status: "success",
        stripeUrl: portalSession.url,
      };
    } catch (error) {
      console.error("Error creating billing portal session:", error);
      return {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Generate checkout session for user subscription
   * @param userId - User ID
   * @param priceId - Stripe price ID
   * @returns Billing result with checkout URL
   */
  async generateUserCheckoutSession(
    userId: string,
    priceId: string,
  ): Promise<BillingResult> {
    try {
      // Get user subscription plan to validate user
      const subscriptionPlan = await getUserSubscriptionPlan(userId);

      // Get user data separately
      const user = await findUserById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const checkoutData: CheckoutSessionData = {
        priceId,
        userId,
        userEmail: user.email!,
        successUrl: absoluteUrl("/dashboard/billing?success=true"),
        cancelUrl: absoluteUrl("/pricing"),
      };

      return await this.createCheckoutSession(checkoutData);
    } catch (error) {
      console.error("Error generating user checkout session:", error);
      return {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Open customer portal for user billing management
   * @param userId - User ID
   * @returns Billing result with portal URL
   */
  async openCustomerPortal(userId: string): Promise<BillingResult> {
    try {
      // Get user subscription plan to validate user and get Stripe customer ID
      const subscriptionPlan = await getUserSubscriptionPlan(userId);

      // Get user data separately
      const user = await findUserById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      if (!subscriptionPlan.stripeCustomerId) {
        throw new Error("User does not have a Stripe customer ID");
      }

      const portalData: BillingPortalData = {
        userId,
        userEmail: user.email!,
        stripeCustomerId: subscriptionPlan.stripeCustomerId,
      };

      return await this.createBillingPortalSession(portalData);
    } catch (error) {
      console.error("Error opening customer portal:", error);
      return {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Validate user access to billing operations
   * @param user - Authenticated user
   * @param targetUserId - Target user ID for the operation
   * @returns True if user has access
   */
  validateUserAccess(user: IAuthUser, targetUserId: string): boolean {
    // Users can only access their own billing information
    // Admins can access any user's billing information
    return user.id === targetUserId || user.role === "ADMIN";
  }

  /**
   * Get billing URL for user
   * @param user - Authenticated user
   * @param targetUserId - Target user ID
   * @returns Billing URL or null if no access
   */
  async getBillingUrl(
    user: IAuthUser,
    targetUserId: string,
  ): Promise<string | null> {
    if (!this.validateUserAccess(user, targetUserId)) {
      return null;
    }

    const result = await this.openCustomerPortal(targetUserId);
    return result.status === "success" ? result.stripeUrl || null : null;
  }

  /**
   * Get checkout URL for user subscription
   * @param user - Authenticated user
   * @param targetUserId - Target user ID
   * @param priceId - Stripe price ID
   * @returns Checkout URL or null if no access
   */
  async getCheckoutUrl(
    user: IAuthUser,
    targetUserId: string,
    priceId: string,
  ): Promise<string | null> {
    if (!this.validateUserAccess(user, targetUserId)) {
      return null;
    }

    const result = await this.generateUserCheckoutSession(
      targetUserId,
      priceId,
    );
    return result.status === "success" ? result.stripeUrl || null : null;
  }
}

/**
 * Default billing service instance
 * Direct instantiation for SaaS starter kit simplicity
 */
export const billingService = new BillingService();
