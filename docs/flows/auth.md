# Authentication Flow

## Overview

Handles user authentication via Google OAuth and email magic links using NextAuth v5. Supports both OAuth providers and passwordless email authentication with role-based access control.

**Main libraries/services:**

- `next-auth` v5 (Auth.js)
- `@auth/prisma-adapter` for database integration
- `resend` for email delivery
- `prisma` for user data persistence

## File Map

```
📁 auth.ts - Main NextAuth configuration
📁 auth.config.ts - Provider configuration (Google, Resend)
📁 app/api/auth/[...nextauth]/route.ts - NextAuth API routes
📁 lib/email.ts - Email sending logic
📁 lib/user.ts - User database operations
📁 lib/session.ts - Session management utilities
📁 components/forms/user-auth-form.tsx - Login/register UI
📁 components/modals/sign-in-modal.tsx - Modal authentication
📁 app/(auth)/login/page.tsx - Login page
📁 app/(auth)/register/page.tsx - Register page
📁 app/(protected)/layout.tsx - Protected route middleware
📁 middleware.ts - Route protection
```

## Step-by-Step Flow

### OAuth Authentication (Google)

1. User clicks "Sign in with Google" button
2. NextAuth redirects to Google OAuth consent screen
3. User grants permissions on Google
4. Google redirects back to `/api/auth/callback/google`
5. NextAuth processes the OAuth response
6. User is created/updated in database via PrismaAdapter
7. JWT token is generated with user data
8. User is redirected to `/dashboard` (or callback URL)

### Email Magic Link Authentication

1. User enters email in login form
2. `UserAuthForm` calls `signIn("resend", { email })`
3. NextAuth generates magic link token
4. `sendVerificationRequest` function is triggered
5. Email is sent via Resend with magic link
6. User clicks link in email
7. NextAuth validates token and creates session
8. User is redirected to dashboard

### Session Management

1. JWT tokens are used for session strategy
2. `jwt` callback fetches fresh user data from database
3. `session` callback enriches session with user role and data
4. Sessions are validated on each protected route access

## Data Flow Diagram

```
[Client] → [NextAuth API] → [OAuth Provider/Email] → [Database: User] → [JWT Session] → [Dashboard]
     ↓
[Protected Routes] ← [Middleware] ← [Session Validation]
```

## Notes and TODOs

- ✅ OAuth providers configured (Google)
- ✅ Email magic links working with Resend
- ✅ Role-based access control implemented
- ✅ Protected routes with middleware
- ⚠️ Email verification request is commented out in auth.config.ts
- 🔄 Consider adding more OAuth providers (GitHub, etc.)
- 🔄 Add email verification flow for new registrations
- 🔄 Implement account linking for users with multiple providers
