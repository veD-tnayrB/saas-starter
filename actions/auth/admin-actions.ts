"use server";

import { getCurrentUser } from "@/repositories/auth/session";
import {
  isPlatformAdmin as isPlatformAdminService,
  isSystemAdmin as isSystemAdminService,
} from "@/services/auth/platform-admin";

/**
 * Server action for client components to check if the current user is a platform admin.
 */
export async function isClientPlatformAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return isPlatformAdminService(user.id);
}

/**
 * Server action for client components to check if the current user is a system admin.
 */
export async function isClientSystemAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return isSystemAdminService(user.id);
}
