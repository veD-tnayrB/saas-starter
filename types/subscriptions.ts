// Core subscription data types
export interface CreateSubscriptionData {
  userId: string;
  priceId: string;
  customerEmail: string;
  metadata?: Record<string, string>;
}

export interface UpdateSubscriptionData {
  priceId?: string;
  cancelAtPeriodEnd?: boolean;
  prorationBehavior?: "create_prorations" | "none" | "always_invoice";
}

export interface SubscriptionData {
  subscriptionId: string;
  customerId: string;
  priceId: string;
  currentPeriodEnd: Date;
  status: string;
  cancelAtPeriodEnd: boolean;
}

// Stripe-specific types
export interface CheckoutSessionData {
  priceId: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
}

export interface BillingPortalData {
  customerId: string;
  returnUrl: string;
}

// Webhook types
export interface WebhookEventData {
  type: string;
  data: any;
  processed: boolean;
}

// Repository types
export interface UserSubscriptionRecord {
  userId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  stripeCurrentPeriodEnd: Date | null;
}

// Service response types
export interface SubscriptionServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Error types
export interface SubscriptionError {
  code: string;
  message: string;
  details?: any;
}

// Plan types (extending existing types)
export interface SubscriptionPlan {
  title: string;
  description: string;
  benefits: string[];
  limitations: string[];
  prices: {
    monthly: number;
    yearly: number;
  };
  stripeIds: {
    monthly: string | null;
    yearly: string | null;
  };
}

export interface UserSubscriptionPlan extends SubscriptionPlan {
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  stripeCurrentPeriodEnd: number | null;
  isPaid: boolean;
  interval: "month" | "year" | null;
  isCanceled?: boolean;
}
