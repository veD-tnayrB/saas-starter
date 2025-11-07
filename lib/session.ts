import "server-only";

import { cache } from "react";
import { getServerSession, type Session } from "next-auth";

// Store the NextAuth config reference to avoid circular dependency
// This will be set by auth.ts on initialization
let nextAuthConfig: any = null;

/**
 * Internal function to set the NextAuth config (called by auth.ts)
 * This avoids circular dependency issues
 */
export function setNextAuthConfig(config: any) {
  nextAuthConfig = config;
}

/**
 * Get the current session (cached for the request)
 * Use this in server components and API routes to avoid multiple session lookups
 * Note: This cache is per-request only. Use revalidatePath() after updating user data.
 */
export const getSession = cache(async (): Promise<Session | null> => {
  // Use config if already set (normal case - set by auth.ts during initialization)
  if (nextAuthConfig) {
    return getServerSession(nextAuthConfig);
  }

  // Fallback: dynamically import config only if not set (rare edge case)
  // This avoids circular dependency: auth.ts imports lib/session, lib/session may need auth config
  // In practice, auth.ts always calls setNextAuthConfig() before this is used
  const authModule = await import("@/auth");
  nextAuthConfig = authModule.default;
  return getServerSession(nextAuthConfig);
});

/**
 * Get the current user from session (cached for the request)
 * Use this when you only need user data, not the full session
 * Note: This cache is per-request only. Use revalidatePath() after updating user data.
 */
export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session?.user) {
    return undefined;
  }
  return session.user;
});

/**
 * Get the current user ID from session (cached for the request)
 * Use this when you only need the user ID for quick checks
 * Note: This cache is per-request only. Use revalidatePath() after updating user data.
 */
export const getCurrentUserId = cache(async (): Promise<string | undefined> => {
  const user = await getCurrentUser();
  return user?.id;
});
