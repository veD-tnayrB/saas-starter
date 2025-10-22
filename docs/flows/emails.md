# Email Handling Flow

## Overview

Manages email delivery for authentication and user communication using Resend service. Primarily handles magic link authentication emails with custom React Email templates.

**Main libraries/services:**

- `resend` - Email delivery service
- `@react-email/components` - Email template components
- `next-auth/providers/resend` - NextAuth email provider integration

## File Map

```
📁 lib/email.ts - Email sending logic and Resend configuration
📁 emails/magic-link-email.tsx - React Email template for magic links
📁 auth.config.ts - Resend provider configuration
📁 components/forms/user-auth-form.tsx - Email authentication UI
📁 config/site.ts - Site configuration for email templates
```

## Step-by-Step Flow

### Magic Link Email Authentication

1. User enters email address in login form
2. `UserAuthForm` calls `signIn("resend", { email })`
3. NextAuth generates secure magic link token
4. `sendVerificationRequest` function is triggered
5. User lookup is performed via `getUserByEmail`
6. Email subject is determined based on user verification status:
   - New users: "Activate your account"
   - Existing users: "Sign-in link for [Site Name]"
7. React Email template is rendered with user data
8. Email is sent via Resend API with custom headers
9. User receives email with magic link button
10. User clicks link to authenticate and access dashboard

### Email Template Rendering

1. `MagicLinkEmail` component receives props:
   - `firstName`: User's name
   - `actionUrl`: Generated magic link
   - `mailType`: "login" or "register"
   - `siteName`: Application name
2. Template renders with Tailwind CSS styling
3. Conditional content based on email type
4. Security messaging for link expiration (24 hours)

### Development vs Production

- **Development**: Emails sent to `delivered@resend.dev` for testing
- **Production**: Emails sent to actual user email addresses
- Custom headers prevent Gmail threading issues

## Data Flow Diagram

```
[Login Form] → [NextAuth] → [Magic Link Generation] → [Email Template] → [Resend API] → [User Inbox]
     ↓
[User Clicks Link] → [Token Validation] → [Session Creation] → [Dashboard Access]
```

## Email Templates

- **Magic Link Email**: Authentication and account activation
- **Newsletter Form**: Marketing email collection (referenced but not implemented)

## Configuration

- **Resend API Key**: Required for email delivery
- **From Address**: Configured in environment variables
- **Email Headers**: Custom headers to prevent threading issues
- **Template Styling**: Tailwind CSS for responsive email design

## Notes and TODOs

- ✅ Magic link authentication working with Resend
- ✅ React Email templates with Tailwind styling
- ✅ Development/production email routing
- ✅ Custom email headers for better deliverability
- ⚠️ Email verification request is commented out in auth.config.ts
- 🔄 Add email templates for password reset
- 🔄 Implement newsletter subscription emails
- 🔄 Add email templates for subscription notifications
- 🔄 Consider adding email templates for admin notifications
- 🔄 Add email delivery tracking and analytics
