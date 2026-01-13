import { findUserById } from "@/repositories/auth/user";
import {
  countAdminMemberships,
  countProjectsByOwner,
} from "@/repositories/projects";

/**
 * Check if user has platform admin privileges
 * A user is a platform admin if they are OWNER or ADMIN in any project
 */
export async function isPlatformAdmin(userId: string): Promise<boolean> {
  try {
    // Check if user is OWNER of any project
    const ownedProjects = await countProjectsByOwner(userId);

    if (ownedProjects > 0) {
      return true;
    }

    // Check if user has ADMIN role in any project
    const adminMemberships = await countAdminMemberships(userId);

    return adminMemberships > 0;
  } catch (error) {
    console.error("Error checking platform admin status:", error);
    return false;
  }
}

/**
 * Check if user is OWNER of any project
 * A user is a platform owner if they are OWNER (not just ADMIN) of any project
 */
export async function isPlatformOwner(userId: string): Promise<boolean> {
  try {
    const ownedProjects = await countProjectsByOwner(userId);
    return ownedProjects > 0;
  } catch (error) {
    console.error("Error checking platform owner status:", error);
    return false;
  }
}

/**
 * Check if user is a System Administrator
 * Defined by having their email listed in process.env.ADMIN_EMAILS
 */
export async function isSystemAdmin(userId: string): Promise<boolean> {
  try {
    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter((email) => email !== "");

    if (adminEmails.length === 0) {
      return false;
    }

    const user = await findUserById(userId);
    if (!user || !user.email) {
      return false;
    }

    return adminEmails.includes(user.email.toLowerCase());
  } catch (error) {
    console.error("Error checking system admin status:", error);
    return false;
  }
}
