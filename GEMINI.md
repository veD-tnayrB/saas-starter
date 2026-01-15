# Gemini Project Context: Next.js SaaS Starter

## Project Overview

This is a comprehensive SaaS starter boilerplate built with Next.js. It provides a solid foundation for building modern, scalable web applications with a focus on a clean architecture and a premium user experience.

The project is a fork of `mickasmt/next-saas-stripe-starter` and includes additional features like multi-project support, project-based roles, and team invitations.

**Main Technologies:**

*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **Authentication:** Auth.js v5 (with Google provider)
*   **Database:** PostgreSQL (intended for use with Neon)
*   **ORM/Query Builder:** Kysely (type-safe SQL query builder)
*   **Styling:** Tailwind CSS with Shadcn/ui components
*   **Payments:** Stripe for subscription management
*   **Email:** Resend for transactional emails (using React Email templates)
*   **Content:** Contentlayer for Markdown-based content (blog, docs)

**Architecture:**

The project follows a clean architecture that separates concerns into distinct layers:

*   **`app/`**: The presentation layer (React Server Components, pages, and API routes).
*   **`components/`**: Reusable React components.
*   **`services/`**: The business logic layer, orchestrating operations.
*   **`repositories/`**: The data access layer, containing all Kysely and raw SQL queries.
*   **`clients/`**: Wrappers for external APIs (Stripe, Resend, etc.).
*   **`actions/`**: Next.js Server Actions for mutations.

## Building and Running

### Prerequisites

*   Node.js
*   pnpm (package manager)
*   A PostgreSQL database (e.g., from [Neon](https://neon.tech/))

### Initial Setup

1.  **Install dependencies:**
    ```bash
    pnpm install
    ```

2.  **Configure environment variables:**
    Copy the `.env.example` file to a new `.env.local` file and fill in the required values for your database, authentication providers, and other services.
    ```bash
    cp .env.example .env.local
    ```

3.  **Run database migrations:**
    Execute the migration scripts to set up your database schema.
    ```bash
    pnpm run db:migrate
    ```

### Development

To run the development server:

```bash
pnpm run dev
```

The application will be available at `http://localhost:3000`.

### Building for Production

To create a production build:

```bash
pnpm run build
```

This command first runs `contentlayer2 build` to generate static content from your Markdown files, then runs `next build`.

### Other Key Scripts

*   **Linting:** Check for code quality and style issues.
    ```bash
    pnpm run lint
    ```
*   **Email Preview:** Start a development server to preview email templates.
    ```bash
    pnpm run email
    ```

## Development Conventions

*   **Package Manager:** This project uses `pnpm`.
*   **Code Style:** Code formatting is enforced by Prettier. A custom import order is defined in `prettier.config.js`.
*   **Linting:** ESLint is used for static analysis, with configurations for Next.js, TypeScript, and Tailwind CSS.
*   **Commits:** Commit messages should follow the Conventional Commits specification, as enforced by `@commitlint/config-conventional`.
*   **Architecture Pattern:** Strictly adhere to the layered architecture (Service/Repository). Business logic should be in services, and database access should be in repositories.
*   **Database Queries:** Use the Kysely query builder for type-safe SQL. All database interactions must be located within the `repositories/` directory.
