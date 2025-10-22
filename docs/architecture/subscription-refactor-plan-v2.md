# Refactor Plan: Subscriptions Module (Updated)

## Step 1: Affected Files

### Current Files to Refactor

- `lib/subscription.ts` - Main subscription logic (to be split)
- `actions/generate-user-stripe.ts` - Server action with business logic
- `app/api/webhooks/stripe/route.ts` - Webhook with direct DB operations

### Files That Import Subscription Logic

- `app/(protected)/dashboard/billing/page.tsx` - Uses `getUserSubscriptionPlan`
- `app/(marketing)/pricing/page.tsx` - Uses `getUserSubscriptionPlan`
- `actions/generate-user-stripe.ts` - Uses `getUserSubscriptionPlan`
- `components/modals/delete-account-modal.tsx` - TODO comment references it

### Configuration Files

- `config/subscriptions.ts` - Pricing data and plan definitions
- `types/index.d.ts` - Type definitions for subscriptions

## Step 2: Layered Architecture Plan

### Types Layer (`types/subscriptions.ts`)

**Responsibility:** Centralized TypeScript interfaces and types for subscription module
**Types to define:**

```typescript
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
```

### Services Layer (`services/subscriptions/`)

#### `services/subscriptions/index.ts`

**Responsibility:** Main entry point, exports all subscription service functions
**Functions to export:**

- `getUserSubscriptionPlan(userId: string)` - from get-plan.ts
- `createSubscription(userId: string, priceId: string)` - from create.ts
- `updateSubscription(subscriptionId: string, priceId: string)` - from update.ts
- `cancelSubscription(subscriptionId: string)` - from cancel.ts
- `handleWebhookEvent(event: Stripe.Event)` - from webhooks.ts
  **Dependencies:** Imports from all submodules, uses helpers.ts internally
  **Documentation:**

```typescript
/**
 * Subscription Services
 *
 * This module provides business logic for subscription management:
 * - get-plan.ts: User subscription plan retrieval and formatting
 * - create.ts: New subscription creation and validation
 * - update.ts: Subscription updates and plan changes
 * - cancel.ts: Subscription cancellation and grace periods
 * - webhooks.ts: Stripe webhook event processing
 * - helpers.ts: Pure utility functions (internal use only)
 */
```

#### `services/subscriptions/helpers.ts`

**Responsibility:** Pure utility functions for subscription logic (INTERNAL USE ONLY)
**Functions to create:**

- `isSubscriptionActive(periodEnd: Date): boolean` - Check if subscription is active
- `determinePlanInterval(priceId: string): 'month' | 'year' | null` - Determine interval
- `findPlanByPriceId(priceId: string): SubscriptionPlan | null` - Find plan by price ID
- `formatSubscriptionPlan(user, plan, isPaid, interval, isCanceled): UserSubscriptionPlan` - Format plan data
- `validatePriceId(priceId: string): boolean` - Validate Stripe price ID format
- `calculateGracePeriod(periodEnd: Date): number` - Calculate days until expiration
  **Dependencies:** Only imports from `types/subscriptions.ts` and `config/subscriptions.ts`
  **Important:** This file should NEVER be imported by repositories or clients, only by other service files

#### `services/subscriptions/get-plan.ts`

**Responsibility:** Business logic for retrieving and formatting user subscription plans
**Functions from current code:**

- `getUserSubscriptionPlan(userId: string): Promise<UserSubscriptionPlan>` - Main logic for plan retrieval and formatting
  **Business logic to include:**
- Plan validation and status checking
- Pricing data matching using helpers
- Interval determination using helpers
- Cancellation status checking
  **Dependencies:**
- Imports from `repositories/subscriptions` for data access
- Imports from `clients/stripe` for Stripe API calls
- Imports from `helpers.ts` for utility functions
- Imports from `types/subscriptions.ts` for types

#### `services/subscriptions/create.ts`

**Responsibility:** Business logic for creating new subscriptions
**Functions to create:**

- `createSubscription(userId: string, priceId: string): Promise<SubscriptionServiceResponse>` - Orchestrates subscription creation
- `validateSubscriptionCreation(userId: string, priceId: string): Promise<boolean>` - Validates before creation
  **Business logic to include:**
- User eligibility checking using helpers
- Plan validation using helpers
- Subscription creation orchestration (calls repository and client)
  **Dependencies:**
- Imports from `repositories/subscriptions` for data access
- Imports from `clients/stripe` for Stripe API calls
- Imports from `helpers.ts` for validation utilities
- Imports from `types/subscriptions.ts` for types

#### `services/subscriptions/update.ts`

**Responsibility:** Business logic for updating existing subscriptions
**Functions to create:**

- `updateSubscription(subscriptionId: string, priceId: string): Promise<SubscriptionServiceResponse>` - Handles plan changes
- `validateSubscriptionUpdate(subscriptionId: string, priceId: string): Promise<boolean>` - Validation logic
  **Business logic to include:**
- Plan change validation using helpers
- Proration handling logic
- Update orchestration (calls repository and client)
  **Dependencies:**
- Imports from `repositories/subscriptions` for data access
- Imports from `clients/stripe` for Stripe API calls
- Imports from `helpers.ts` for validation utilities
- Imports from `types/subscriptions.ts` for types

#### `services/subscriptions/cancel.ts`

**Responsibility:** Business logic for canceling subscriptions
**Functions to create:**

- `cancelSubscription(subscriptionId: string): Promise<SubscriptionServiceResponse>` - Handles cancellation
- `validateSubscriptionCancellation(subscriptionId: string): Promise<boolean>` - Validation logic
  **Business logic to include:**
- Cancellation policy enforcement using helpers
- Grace period handling using helpers
- Cancellation orchestration (calls repository and client)
  **Dependencies:**
- Imports from `repositories/subscriptions` for data access
- Imports from `clients/stripe` for Stripe API calls
- Imports from `helpers.ts` for policy utilities
- Imports from `types/subscriptions.ts` for types

#### `services/subscriptions/webhooks.ts`

**Responsibility:** Business logic for handling Stripe webhook events
**Functions to create:**

- `handleWebhookEvent(event: Stripe.Event): Promise<SubscriptionServiceResponse>` - Main webhook handler
- `handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void>` - Checkout completion logic
- `handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void>` - Payment success logic
  **Business logic to include:**
- Event validation using helpers
- Business rule enforcement
- Data transformation using helpers
- Orchestration of repository and client calls
  **Dependencies:**
- Imports from `repositories/subscriptions` for data access
- Imports from `clients/stripe` for Stripe API calls
- Imports from `helpers.ts` for validation utilities
- Imports from `types/subscriptions.ts` for types

### Repositories Layer (`repositories/subscriptions/`)

#### `repositories/subscriptions/index.ts`

**Responsibility:** Main entry point, exports all repository functions
**Functions to export:**

- `findUserSubscription(userId: string)` - from find.ts
- `createUserSubscription(data: CreateSubscriptionData)` - from create.ts
- `updateUserSubscription(userId: string, data: UpdateSubscriptionData)` - from update.ts
- `cancelUserSubscription(userId: string)` - from cancel.ts
  **Dependencies:** Only imports from `types/subscriptions.ts` and `lib/db.ts`
  **Documentation:**

```typescript
/**
 * Subscription Repositories
 *
 * This module provides data access for subscription management:
 * - find.ts: Database queries for finding subscription data
 * - create.ts: Database operations for creating subscription records
 * - update.ts: Database operations for updating subscription records
 * - cancel.ts: Database operations for canceling subscriptions
 */
```

#### `repositories/subscriptions/find.ts`

**Responsibility:** Database queries for finding subscription data
**Functions to create:**

- `findUserSubscription(userId: string): Promise<UserSubscriptionRecord | null>` - Get user subscription data
- `findUserByStripeCustomerId(customerId: string): Promise<UserSubscriptionRecord | null>` - Find user by Stripe customer ID
- `findUserByStripeSubscriptionId(subscriptionId: string): Promise<UserSubscriptionRecord | null>` - Find user by Stripe subscription ID
  **Database operations:**
- Prisma queries for user subscription data
- Data selection and filtering
- Error handling for database operations
  **Dependencies:** Only imports from `lib/db.ts` and `types/subscriptions.ts`

#### `repositories/subscriptions/create.ts`

**Responsibility:** Database operations for creating subscription records
**Functions to create:**

- `createUserSubscription(data: CreateSubscriptionData): Promise<UserSubscriptionRecord>` - Create new subscription record
- `updateUserOnSubscriptionCreate(userId: string, subscriptionData: SubscriptionData): Promise<UserSubscriptionRecord>` - Update user with new subscription
  **Database operations:**
- Prisma create/update operations
- Data validation and transformation
- Error handling for database operations
  **Dependencies:** Only imports from `lib/db.ts` and `types/subscriptions.ts`

#### `repositories/subscriptions/update.ts`

**Responsibility:** Database operations for updating subscription records
**Functions to create:**

- `updateUserSubscription(userId: string, data: UpdateSubscriptionData): Promise<UserSubscriptionRecord>` - Update subscription data
- `updateSubscriptionPeriod(subscriptionId: string, periodEnd: Date): Promise<UserSubscriptionRecord>` - Update period end
- `updateSubscriptionPrice(subscriptionId: string, priceId: string): Promise<UserSubscriptionRecord>` - Update price ID
  **Database operations:**
- Prisma update operations
- Conditional updates based on subscription status
- Error handling for database operations
  **Dependencies:** Only imports from `lib/db.ts` and `types/subscriptions.ts`

#### `repositories/subscriptions/cancel.ts`

**Responsibility:** Database operations for canceling subscriptions
**Functions to create:**

- `cancelUserSubscription(userId: string): Promise<UserSubscriptionRecord>` - Mark subscription as canceled
- `updateSubscriptionCancellation(subscriptionId: string, canceledAt: Date): Promise<UserSubscriptionRecord>` - Update cancellation status
  **Database operations:**
- Prisma update operations for cancellation
- Soft delete or status update patterns
- Error handling for database operations
  **Dependencies:** Only imports from `lib/db.ts` and `types/subscriptions.ts`

### Clients Layer (`clients/stripe/`)

#### `clients/stripe/index.ts`

**Responsibility:** Main entry point, exports all Stripe client functions
**Functions to export:**

- `createCheckoutSession(data: CheckoutSessionData)` - from subscription.ts
- `createBillingPortalSession(customerId: string, returnUrl: string)` - from subscription.ts
- `retrieveSubscription(subscriptionId: string)` - from subscription.ts
- `updateSubscription(subscriptionId: string, data: UpdateSubscriptionData)` - from subscription.ts
- `cancelSubscription(subscriptionId: string)` - from subscription.ts
- `retrieveInvoice(invoiceId: string)` - from invoices.ts
  **Dependencies:** Only imports from `lib/stripe.ts` and `types/subscriptions.ts`
  **Documentation:**

```typescript
/**
 * Stripe Clients
 *
 * This module provides Stripe API integration:
 * - subscription.ts: Stripe API calls for subscription operations
 * - invoices.ts: Stripe API calls for invoice operations
 */
```

#### `clients/stripe/subscription.ts`

**Responsibility:** Stripe API calls for subscription operations
**Functions to create:**

- `createCheckoutSession(data: CheckoutSessionData): Promise<Stripe.Checkout.Session>` - Create Stripe checkout session
- `createBillingPortalSession(customerId: string, returnUrl: string): Promise<Stripe.BillingPortal.Session>` - Create billing portal session
- `retrieveSubscription(subscriptionId: string): Promise<Stripe.Subscription>` - Get subscription from Stripe
- `updateSubscription(subscriptionId: string, data: UpdateSubscriptionData): Promise<Stripe.Subscription>` - Update subscription in Stripe
- `cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription>` - Cancel subscription in Stripe
  **Stripe operations:**
- Checkout session creation
- Billing portal session creation
- Subscription retrieval and updates
- Error handling for Stripe API calls
  **Dependencies:** Only imports from `lib/stripe.ts` and `types/subscriptions.ts`

#### `clients/stripe/invoices.ts`

**Responsibility:** Stripe API calls for invoice operations
**Functions to create:**

- `retrieveInvoice(invoiceId: string): Promise<Stripe.Invoice>` - Get invoice from Stripe
- `listInvoices(customerId: string): Promise<Stripe.Invoice[]>` - List customer invoices
- `retrieveUpcomingInvoice(customerId: string): Promise<Stripe.Invoice>` - Get upcoming invoice
  **Stripe operations:**
- Invoice retrieval
- Invoice listing
- Upcoming invoice handling
- Error handling for Stripe API calls
  **Dependencies:** Only imports from `lib/stripe.ts` and `types/subscriptions.ts`

## Step 3: Step-by-Step Migration Instructions

### Phase 1: Create Types and Repository Layer

1. **Create types structure:**

   ```bash
   mkdir -p types
   ```

2. **Create `types/subscriptions.ts`:**

   - Define all TypeScript interfaces
   - Export types for use across all layers
   - Ensure type safety and consistency

3. **Create repository structure:**

   ```bash
   mkdir -p repositories/subscriptions
   ```

4. **Create `repositories/subscriptions/index.ts`:**

   - Export all repository functions
   - Add documentation comments
   - Import only from `types/subscriptions.ts` and `lib/db.ts`

5. **Create `repositories/subscriptions/find.ts`:**

   - Move Prisma queries from `lib/subscription.ts`
   - Extract `findUserSubscription` logic
   - Add proper error handling
   - Use types from `types/subscriptions.ts`

6. **Create `repositories/subscriptions/create.ts`:**

   - Extract subscription creation logic from webhook
   - Add `createUserSubscription` function
   - Handle database operations for new subscriptions
   - Use types from `types/subscriptions.ts`

7. **Create `repositories/subscriptions/update.ts`:**

   - Extract subscription update logic from webhook
   - Add `updateUserSubscription` function
   - Handle database operations for subscription changes
   - Use types from `types/subscriptions.ts`

8. **Create `repositories/subscriptions/cancel.ts`:**
   - Add subscription cancellation database operations
   - Handle soft delete or status updates
   - Use types from `types/subscriptions.ts`

### Phase 2: Create Clients Layer

1. **Create client structure:**

   ```bash
   mkdir -p clients/stripe
   ```

2. **Create `clients/stripe/index.ts`:**

   - Export all Stripe client functions
   - Add documentation comments
   - Import only from `lib/stripe.ts` and `types/subscriptions.ts`

3. **Create `clients/stripe/subscription.ts`:**

   - Move Stripe API calls from `actions/generate-user-stripe.ts`
   - Extract checkout session creation logic
   - Extract billing portal session creation logic
   - Add subscription retrieval and update functions
   - Use types from `types/subscriptions.ts`

4. **Create `clients/stripe/invoices.ts`:**
   - Add invoice-related Stripe API calls
   - Handle invoice retrieval and listing
   - Use types from `types/subscriptions.ts`

### Phase 3: Create Services Layer

1. **Create service structure:**

   ```bash
   mkdir -p services/subscriptions
   ```

2. **Create `services/subscriptions/helpers.ts`:**

   - Extract pure utility functions from `lib/subscription.ts`
   - Move plan validation logic
   - Move interval determination logic
   - Move plan formatting logic
   - Import only from `types/subscriptions.ts` and `config/subscriptions.ts`
   - **Important:** This file should NEVER be imported by repositories or clients

3. **Create `services/subscriptions/get-plan.ts`:**

   - Move `getUserSubscriptionPlan` function
   - Use repository for database access
   - Use client for Stripe API calls
   - Use helpers for utility functions
   - Keep business logic for plan formatting
   - Import from `types/subscriptions.ts`

4. **Create `services/subscriptions/create.ts`:**

   - Extract subscription creation business logic
   - Orchestrate repository and client calls
   - Use helpers for validation
   - Add validation and error handling
   - Import from `types/subscriptions.ts`

5. **Create `services/subscriptions/update.ts`:**

   - Add subscription update business logic
   - Handle plan changes and proration
   - Orchestrate repository and client calls
   - Use helpers for validation
   - Import from `types/subscriptions.ts`

6. **Create `services/subscriptions/cancel.ts`:**

   - Add subscription cancellation business logic
   - Handle cancellation policies
   - Orchestrate repository and client calls
   - Use helpers for policy utilities
   - Import from `types/subscriptions.ts`

7. **Create `services/subscriptions/webhooks.ts`:**

   - Move webhook handling logic from `app/api/webhooks/stripe/route.ts`
   - Extract business logic for event handling
   - Use repository for database operations
   - Use client for Stripe API calls
   - Use helpers for validation utilities
   - Import from `types/subscriptions.ts`

8. **Create `services/subscriptions/index.ts`:**
   - Export all service functions
   - Add documentation comments
   - Provide clean API for other parts of the application
   - Import from all submodules and `types/subscriptions.ts`

### Phase 4: Update Actions and API Routes (Gradual Migration)

1. **Update `actions/generate-user-stripe.ts`:**

   - Remove direct Stripe API calls
   - Remove business logic
   - Call service functions instead
   - Keep only action-specific logic (auth, redirects)
   - **Temporary:** Keep old import as fallback during migration

2. **Update `app/api/webhooks/stripe/route.ts`:**

   - Remove direct Prisma calls
   - Remove business logic
   - Call webhook service function
   - Keep only webhook-specific logic (signature verification, response)
   - **Temporary:** Keep old import as fallback during migration

3. **Update page components:**
   - Update imports to use new service functions
   - **Temporary:** Keep old import as fallback during migration
   - No changes needed to component logic

### Phase 5: Clean Up and Final Migration

1. **Remove temporary fallback imports:**

   - Remove old imports from `lib/subscription.ts` in all files
   - Ensure all files use new service imports

2. **Remove `lib/subscription.ts`:**

   - Delete the original file
   - Update any remaining imports

3. **Update imports across the codebase:**

   - Update all files that import from `lib/subscription.ts`
   - Use new service imports instead

4. **Add final TypeScript interfaces:**

   - Ensure all types are properly defined
   - Add error types and response types
   - Ensure type safety across all layers

5. **Add documentation:**
   - Add JSDoc comments to all public functions
   - Update README with new architecture
   - Add migration notes for future developers

## Step 4: Verification Checklist

### Types Layer Verification

- [ ] All TypeScript interfaces defined in `types/subscriptions.ts`
- [ ] Types are imported consistently across all layers
- [ ] No type duplication or conflicts
- [ ] Proper error types and response types defined
- [ ] Types are exported and accessible from all modules

### Repository Layer Verification

- [ ] All database operations are in repository files
- [ ] No business logic in repository files
- [ ] No imports from services or clients (only types and lib/db)
- [ ] Proper error handling for database operations
- [ ] Repository functions are pure (no side effects beyond database)
- [ ] Documentation comments added to index.ts

### Clients Layer Verification

- [ ] All Stripe API calls are in client files
- [ ] No business logic in client files
- [ ] No imports from services or repositories (only types and lib/stripe)
- [ ] Proper error handling for Stripe API calls
- [ ] Client functions handle Stripe-specific concerns only
- [ ] Documentation comments added to index.ts

### Services Layer Verification

- [ ] All business logic is in service files
- [ ] Services orchestrate repository and client calls
- [ ] No direct database or API calls in services
- [ ] Helpers.ts is only imported by other service files
- [ ] Proper error handling and validation
- [ ] Services are testable and focused on single responsibilities
- [ ] Documentation comments added to index.ts

### Actions and API Routes Verification

- [ ] Actions only call service functions
- [ ] No business logic in actions
- [ ] No direct database or API calls in actions
- [ ] Actions handle only action-specific concerns (auth, redirects, responses)
- [ ] API routes only call service functions
- [ ] No business logic in API routes
- [ ] All old imports removed (no fallback imports)

### Integration Verification

- [ ] All existing functionality works as before
- [ ] No breaking changes to public APIs
- [ ] All imports updated correctly
- [ ] TypeScript compilation passes
- [ ] No circular dependencies
- [ ] Proper error handling throughout the stack
- [ ] No duplicate functions between services and clients

### Code Quality Verification

- [ ] Each file has a single responsibility
- [ ] Functions are small and focused
- [ ] Proper TypeScript types throughout
- [ ] Consistent error handling patterns
- [ ] Clear separation of concerns
- [ ] No code duplication
- [ ] Documentation comments in all index.ts files

### Performance Verification

- [ ] No performance regressions
- [ ] Database queries are optimized
- [ ] Stripe API calls are efficient
- [ ] No unnecessary data fetching
- [ ] Proper caching where appropriate

### Migration Verification

- [ ] Gradual migration completed successfully
- [ ] No temporary fallback imports remaining
- [ ] All old code removed
- [ ] New architecture is fully implemented
- [ ] Documentation updated

This refactoring will transform the monolithic subscription module into a clean, maintainable, and testable architecture while preserving all existing functionality and following best practices for dependency management.
