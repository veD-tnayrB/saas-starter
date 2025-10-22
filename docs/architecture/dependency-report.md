# Dependency Analysis Report

**Generated:** 2025-01-21

## Overview

This SaaS Starter project follows a Next.js 14 App Router architecture with a clear separation of concerns across multiple layers. The project demonstrates good architectural practices with proper dependency direction, though there are some areas where responsibilities could be better separated for improved scalability and maintainability.

## Layer Map

```
app/ (Routes & API)
├── (auth)/ - Authentication pages
├── (docs)/ - Documentation pages
├── (marketing)/ - Marketing pages
├── (protected)/ - Protected dashboard pages
└── api/ - API routes and webhooks

actions/ (Server Actions)
├── generate-user-stripe.ts
├── open-customer-portal.ts
├── update-user-name.ts
└── update-user-role.ts

lib/ (Utilities & Services)
├── db.ts - Prisma client
├── email.ts - Email service (Resend)
├── stripe.ts - Stripe client
├── subscription.ts - Subscription logic
├── user.ts - User operations
└── validations/ - Zod schemas

components/ (UI Components)
├── ui/ - Base UI components (shadcn/ui)
├── forms/ - Form components
├── layout/ - Layout components
└── shared/ - Reusable components

config/ (Configuration)
├── site.ts
├── subscriptions.ts
├── docs.ts
└── blog.ts
```

## Inferred Responsibilities

| Layer         | Purpose                                                  | Notes                                          |
| ------------- | -------------------------------------------------------- | ---------------------------------------------- |
| `app/`        | Route handlers, API endpoints, page components           | Clean separation by feature groups             |
| `actions/`    | Server actions for form submissions and mutations        | Good use of Next.js 14 server actions          |
| `lib/`        | Business logic, external service integrations, utilities | **Mixed responsibilities** - needs refactoring |
| `components/` | UI components and presentation logic                     | Well organized by feature                      |
| `config/`     | Application configuration and constants                  | Clean separation                               |
| `hooks/`      | Custom React hooks                                       | Good reusability                               |
| `types/`      | TypeScript type definitions                              | Proper type safety                             |

## Dependency Graph Summary

```
A (app) imports B (actions)
A (app) imports C (lib)
A (app) imports D (components)
B (actions) imports C (lib)
B (actions) imports E (auth)
C (lib) imports F (config)
C (lib) imports G (external services)
D (components) imports C (lib)
D (components) imports H (hooks)
```

**Dependency Direction:** ✅ Generally correct (top-down)
**Circular Dependencies:** ❌ None detected
**Reverse Dependencies:** ❌ None detected

## Cross-Layer Issues

### High Priority Issues

1. **`lib/subscription.ts`** → Mixes business logic with direct Prisma calls and Stripe API calls

   - **Problem:** Single file handles subscription logic, database queries, and external API calls
   - **Impact:** Hard to test, violates single responsibility principle

2. **`actions/generate-user-stripe.ts`** → Contains business logic that should be in services

   - **Problem:** Server action directly handles complex subscription logic
   - **Impact:** Actions become bloated, business logic scattered

3. **`app/api/webhooks/stripe/route.ts`** → Direct database operations in API route
   - **Problem:** Webhook handler directly calls Prisma without service layer
   - **Impact:** Business logic in API layer, hard to reuse

### Medium Priority Issues

4. **`lib/email.ts`** → Email service mixed with NextAuth provider logic

   - **Problem:** Email service tightly coupled to NextAuth
   - **Impact:** Hard to use email service independently

5. **`lib/user.ts`** → Simple wrapper around Prisma calls
   - **Problem:** No business logic, just database access
   - **Impact:** Could be simplified or moved to repository layer

## External Integrations Map

| Integration      | Used In                                              | Config Path               | Recommendation        |
| ---------------- | ---------------------------------------------------- | ------------------------- | --------------------- |
| **Stripe**       | `/lib/stripe.ts`, `/actions/`, `/app/api/webhooks/`  | `/lib/stripe.ts`          | ✅ Centralized config |
| **Resend**       | `/lib/email.ts`                                      | `/lib/email.ts`           | ✅ Centralized config |
| **Prisma**       | `/lib/db.ts`, `/lib/subscription.ts`, `/lib/user.ts` | `/lib/db.ts`              | ✅ Centralized config |
| **NextAuth**     | `/auth.ts`, `/auth.config.ts`                        | `/auth.config.ts`         | ✅ Centralized config |
| **Contentlayer** | `/contentlayer.config.ts`                            | `/contentlayer.config.ts` | ✅ Centralized config |

## Improvement Opportunities

### High Priority

- **Extract Service Layer**: Create `services/` directory for business logic
- **Repository Pattern**: Implement repository pattern for data access
- **Separate Concerns**: Split `lib/subscription.ts` into multiple focused modules
- **Webhook Service**: Extract webhook logic into dedicated service

### Medium Priority

- **Email Service Refactor**: Decouple email service from NextAuth
- **Validation Layer**: Centralize validation logic
- **Error Handling**: Implement consistent error handling strategy
- **Type Safety**: Add proper TypeScript types for all services

### Low Priority

- **Caching Layer**: Add caching for frequently accessed data
- **Logging**: Implement structured logging
- **Monitoring**: Add performance monitoring
- **Testing**: Add unit and integration tests

## Recommended Architecture Refactor

### Target Structure

```
services/
├── auth.service.ts - Authentication business logic
├── subscription.service.ts - Subscription management
├── user.service.ts - User management
└── email.service.ts - Email operations

repositories/
├── user.repository.ts - User data access
├── subscription.repository.ts - Subscription data access
└── base.repository.ts - Common repository functionality

lib/
├── clients/ - External service clients
├── utils/ - Pure utility functions
└── validations/ - Schema validations
```

### Benefits

- **Testability**: Each service can be unit tested independently
- **Reusability**: Business logic can be reused across different entry points
- **Maintainability**: Clear separation of concerns
- **Scalability**: Easy to add new features without affecting existing code

## Next Step Recommendation

1. **Start with Service Layer**: Extract business logic from `lib/subscription.ts` into `services/subscription.service.ts`
2. **Implement Repository Pattern**: Create `repositories/user.repository.ts` for data access
3. **Refactor Actions**: Move business logic from actions to services
4. **Add Error Handling**: Implement consistent error handling across all layers
5. **Add Tests**: Write unit tests for services and integration tests for repositories

This refactoring will significantly improve the codebase's maintainability, testability, and scalability while maintaining the existing functionality.
