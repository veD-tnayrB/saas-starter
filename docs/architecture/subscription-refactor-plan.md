# Refactor Plan: Subscriptions Module

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

### Services Layer (`services/subscriptions/`)

#### `services/subscriptions/index.ts`

**Responsibility:** Main entry point, exports all subscription service functions
**Functions to export:**

- `getUserSubscriptionPlan(userId: string)`
- `createSubscription(userId: string, priceId: string)`
- `updateSubscription(subscriptionId: string, priceId: string)`
- `cancelSubscription(subscriptionId: string)`
- `handleWebhookEvent(event: Stripe.Event)`

#### `services/subscriptions/get-plan.ts`

**Responsibility:** Business logic for retrieving and formatting user subscription plans
**Functions from current code:**

- `getUserSubscriptionPlan(userId: string)` - Main logic for plan retrieval and formatting
  **Business logic to include:**
- Plan validation and status checking
- Pricing data matching
- Interval determination (monthly/yearly)
- Cancellation status checking

#### `services/subscriptions/create.ts`

**Responsibility:** Business logic for creating new subscriptions
**Functions to create:**

- `createSubscription(userId: string, priceId: string)` - Orchestrates subscription creation
- `validateSubscriptionCreation(userId: string, priceId: string)` - Validates before creation
  **Business logic to include:**
- User eligibility checking
- Plan validation
- Subscription creation orchestration

#### `services/subscriptions/update.ts`

**Responsibility:** Business logic for updating existing subscriptions
**Functions to create:**

- `updateSubscription(subscriptionId: string, priceId: string)` - Handles plan changes
- `validateSubscriptionUpdate(subscriptionId: string, priceId: string)` - Validation logic
  **Business logic to include:**
- Plan change validation
- Proration handling
- Update orchestration

#### `services/subscriptions/cancel.ts`

**Responsibility:** Business logic for canceling subscriptions
**Functions to create:**

- `cancelSubscription(subscriptionId: string)` - Handles cancellation
- `validateSubscriptionCancellation(subscriptionId: string)` - Validation logic
  **Business logic to include:**
- Cancellation policy enforcement
- Grace period handling
- Cancellation orchestration

#### `services/subscriptions/webhooks.ts`

**Responsibility:** Business logic for handling Stripe webhook events
**Functions to create:**

- `handleWebhookEvent(event: Stripe.Event)` - Main webhook handler
- `handleCheckoutCompleted(session: Stripe.Checkout.Session)` - Checkout completion logic
- `handlePaymentSucceeded(invoice: Stripe.Invoice)` - Payment success logic
  **Business logic to include:**
- Event validation
- Business rule enforcement
- Data transformation

#### `services/subscriptions/helpers.ts`

**Responsibility:** Pure utility functions for subscription logic
**Functions to create:**

- `isSubscriptionActive(periodEnd: Date)` - Check if subscription is active
- `determinePlanInterval(priceId: string)` - Determine monthly/yearly interval
- `findPlanByPriceId(priceId: string)` - Find plan configuration by price ID
- `formatSubscriptionPlan(user, plan, isPaid, interval, isCanceled)` - Format plan data

### Repositories Layer (`repositories/subscriptions/`)

#### `repositories/subscriptions/index.ts`

**Responsibility:** Main entry point, exports all repository functions
**Functions to export:**

- `findUserSubscription(userId: string)`
- `createUserSubscription(data: CreateSubscriptionData)`
- `updateUserSubscription(userId: string, data: UpdateSubscriptionData)`
- `cancelUserSubscription(userId: string)`

#### `repositories/subscriptions/find.ts`

**Responsibility:** Database queries for finding subscription data
**Functions to create:**

- `findUserSubscription(userId: string)` - Get user subscription data
- `findUserByStripeCustomerId(customerId: string)` - Find user by Stripe customer ID
- `findUserByStripeSubscriptionId(subscriptionId: string)` - Find user by Stripe subscription ID
  **Database operations:**
- Prisma queries for user subscription data
- Data selection and filtering

#### `repositories/subscriptions/create.ts`

**Responsibility:** Database operations for creating subscription records
**Functions to create:**

- `createUserSubscription(data: CreateSubscriptionData)` - Create new subscription record
- `updateUserOnSubscriptionCreate(userId: string, subscriptionData: SubscriptionData)` - Update user with new subscription
  **Database operations:**
- Prisma create/update operations
- Data validation and transformation

#### `repositories/subscriptions/update.ts`

**Responsibility:** Database operations for updating subscription records
**Functions to create:**

- `updateUserSubscription(userId: string, data: UpdateSubscriptionData)` - Update subscription data
- `updateSubscriptionPeriod(subscriptionId: string, periodEnd: Date)` - Update period end
- `updateSubscriptionPrice(subscriptionId: string, priceId: string)` - Update price ID
  **Database operations:**
- Prisma update operations
- Conditional updates based on subscription status

#### `repositories/subscriptions/cancel.ts`

**Responsibility:** Database operations for canceling subscriptions
**Functions to create:**

- `cancelUserSubscription(userId: string)` - Mark subscription as canceled
- `updateSubscriptionCancellation(subscriptionId: string, canceledAt: Date)` - Update cancellation status
  **Database operations:**
- Prisma update operations for cancellation
- Soft delete or status update patterns

### Clients Layer (`clients/stripe/`)

#### `clients/stripe/index.ts`

**Responsibility:** Main entry point, exports all Stripe client functions
**Functions to export:**

- `createCheckoutSession(data: CheckoutSessionData)`
- `createBillingPortalSession(customerId: string, returnUrl: string)`
- `retrieveSubscription(subscriptionId: string)`
- `updateSubscription(subscriptionId: string, data: UpdateSubscriptionData)`
- `cancelSubscription(subscriptionId: string)`

#### `clients/stripe/subscription.ts`

**Responsibility:** Stripe API calls for subscription operations
**Functions to create:**

- `createCheckoutSession(data: CheckoutSessionData)` - Create Stripe checkout session
- `createBillingPortalSession(customerId: string, returnUrl: string)` - Create billing portal session
- `retrieveSubscription(subscriptionId: string)` - Get subscription from Stripe
- `updateSubscription(subscriptionId: string, data: UpdateSubscriptionData)` - Update subscription in Stripe
- `cancelSubscription(subscriptionId: string)` - Cancel subscription in Stripe
  **Stripe operations:**
- Checkout session creation
- Billing portal session creation
- Subscription retrieval and updates
- Error handling for Stripe API calls

#### `clients/stripe/invoices.ts`

**Responsibility:** Stripe API calls for invoice operations
**Functions to create:**

- `retrieveInvoice(invoiceId: string)` - Get invoice from Stripe
- `listInvoices(customerId: string)` - List customer invoices
- `retrieveUpcomingInvoice(customerId: string)` - Get upcoming invoice
  **Stripe operations:**
- Invoice retrieval
- Invoice listing
- Upcoming invoice handling

## Step 3: Step-by-Step Migration Instructions

### Phase 1: Create Repository Layer

1. **Create repository structure:**

   ```bash
   mkdir -p repositories/subscriptions
   ```

2. **Create `repositories/subscriptions/index.ts`:**

   - Export all repository functions
   - Define TypeScript interfaces for data types

3. **Create `repositories/subscriptions/find.ts`:**

   - Move Prisma queries from `lib/subscription.ts`
   - Extract `findUserSubscription` logic
   - Add proper error handling

4. **Create `repositories/subscriptions/create.ts`:**

   - Extract subscription creation logic from webhook
   - Add `createUserSubscription` function
   - Handle database operations for new subscriptions

5. **Create `repositories/subscriptions/update.ts`:**

   - Extract subscription update logic from webhook
   - Add `updateUserSubscription` function
   - Handle database operations for subscription changes

6. **Create `repositories/subscriptions/cancel.ts`:**
   - Add subscription cancellation database operations
   - Handle soft delete or status updates

### Phase 2: Create Clients Layer

1. **Create client structure:**

   ```bash
   mkdir -p clients/stripe
   ```

2. **Create `clients/stripe/index.ts`:**

   - Export all Stripe client functions
   - Define TypeScript interfaces for Stripe data

3. **Create `clients/stripe/subscription.ts`:**

   - Move Stripe API calls from `actions/generate-user-stripe.ts`
   - Extract checkout session creation logic
   - Extract billing portal session creation logic
   - Add subscription retrieval and update functions

4. **Create `clients/stripe/invoices.ts`:**
   - Add invoice-related Stripe API calls
   - Handle invoice retrieval and listing

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

3. **Create `services/subscriptions/get-plan.ts`:**

   - Move `getUserSubscriptionPlan` function
   - Use repository for database access
   - Use client for Stripe API calls
   - Keep business logic for plan formatting

4. **Create `services/subscriptions/create.ts`:**

   - Extract subscription creation business logic
   - Orchestrate repository and client calls
   - Add validation and error handling

5. **Create `services/subscriptions/update.ts`:**

   - Add subscription update business logic
   - Handle plan changes and proration
   - Orchestrate repository and client calls

6. **Create `services/subscriptions/cancel.ts`:**

   - Add subscription cancellation business logic
   - Handle cancellation policies
   - Orchestrate repository and client calls

7. **Create `services/subscriptions/webhooks.ts`:**

   - Move webhook handling logic from `app/api/webhooks/stripe/route.ts`
   - Extract business logic for event handling
   - Use repository for database operations

8. **Create `services/subscriptions/index.ts`:**
   - Export all service functions
   - Provide clean API for other parts of the application

### Phase 4: Update Actions and API Routes

1. **Update `actions/generate-user-stripe.ts`:**

   - Remove direct Stripe API calls
   - Remove business logic
   - Call service functions instead
   - Keep only action-specific logic (auth, redirects)

2. **Update `app/api/webhooks/stripe/route.ts`:**

   - Remove direct Prisma calls
   - Remove business logic
   - Call webhook service function
   - Keep only webhook-specific logic (signature verification, response)

3. **Update page components:**
   - Update imports to use new service functions
   - No changes needed to component logic

### Phase 5: Clean Up

1. **Remove `lib/subscription.ts`:**

   - Delete the original file
   - Update any remaining imports

2. **Update imports across the codebase:**

   - Update all files that import from `lib/subscription.ts`
   - Use new service imports instead

3. **Add TypeScript interfaces:**
   - Define proper interfaces for all data types
   - Add error types and response types
   - Ensure type safety across all layers

## Step 4: Verification Checklist

### Repository Layer Verification

- [ ] All database operations are in repository files
- [ ] No business logic in repository files
- [ ] Proper error handling for database operations
- [ ] TypeScript interfaces defined for all data types
- [ ] Repository functions are pure (no side effects beyond database)

### Clients Layer Verification

- [ ] All Stripe API calls are in client files
- [ ] No business logic in client files
- [ ] Proper error handling for Stripe API calls
- [ ] TypeScript interfaces defined for Stripe data
- [ ] Client functions handle Stripe-specific concerns only

### Services Layer Verification

- [ ] All business logic is in service files
- [ ] Services orchestrate repository and client calls
- [ ] No direct database or API calls in services
- [ ] Proper error handling and validation
- [ ] Services are testable and focused on single responsibilities

### Actions and API Routes Verification

- [ ] Actions only call service functions
- [ ] No business logic in actions
- [ ] No direct database or API calls in actions
- [ ] Actions handle only action-specific concerns (auth, redirects, responses)
- [ ] API routes only call service functions
- [ ] No business logic in API routes

### Integration Verification

- [ ] All existing functionality works as before
- [ ] No breaking changes to public APIs
- [ ] All imports updated correctly
- [ ] TypeScript compilation passes
- [ ] No circular dependencies
- [ ] Proper error handling throughout the stack

### Code Quality Verification

- [ ] Each file has a single responsibility
- [ ] Functions are small and focused
- [ ] Proper TypeScript types throughout
- [ ] Consistent error handling patterns
- [ ] Clear separation of concerns
- [ ] No code duplication

### Performance Verification

- [ ] No performance regressions
- [ ] Database queries are optimized
- [ ] Stripe API calls are efficient
- [ ] No unnecessary data fetching
- [ ] Proper caching where appropriate

This refactoring will transform the monolithic subscription module into a clean, maintainable, and testable architecture while preserving all existing functionality.
