// Core subscription data types
export interface ICreateSubscriptionData {
  userId: string;
  priceId: string;
  customerEmail: string;
  metadata?: Record<string, string>;
}

export interface IUpdateSubscriptionData {
  priceId?: string;
  cancelAtPeriodEnd?: boolean;
  prorationBehavior?: "create_prorations" | "none" | "always_invoice";
}

export interface ISubscriptionData {
  subscriptionId: string;
  customerId: string;
  priceId: string;
  currentPeriodEnd: Date;
  status: string;
  cancelAtPeriodEnd: boolean;
}

// Stripe-specific types
export interface ICheckoutSessionData {
  priceId: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
}

export interface IBillingPortalData {
  customerId: string;
  returnUrl: string;
}

// Webhook types
export interface IWebhookEventData {
  type: string;
  data: Record<string, unknown>;
  processed: boolean;
}

// Repository types
export interface IUserSubscriptionRecord {
  userId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  stripeCurrentPeriodEnd: Date | null;
}

// Service response types
export interface ISubscriptionServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Error types
export interface ISubscriptionError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
