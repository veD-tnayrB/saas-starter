/**
 * Admin Access Validation
 *
 * Validates if a user can access admin/internal management pages.
 * Only accessible in development OR if user is ADMIN/OWNER of any project.
 */

import { getCurrentUser } from "@/repositories/auth/session";
import { countAdminMemberships } from "@/repositories/projects";

/**
 * Check if current user can access admin pages
 */
export async function canAccessAdminPages(): Promise<boolean> {
  // In development, always allow access
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  // In production, check if user is ADMIN or OWNER of any project
  try {
    const user = await getCurrentUser();
    if (!user) {
      return false;
    }

    const adminMemberships = await countAdminMemberships(user.id);
    return adminMemberships > 0;
  } catch (error) {
    console.error("Error checking admin access:", error);
    return false;
  }
}

