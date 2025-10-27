import type {
  AuthUser,
  UserActivity,
  UserCreateData,
  UserProfile,
  UserSearchCriteria,
  UserStats,
  UserUpdateData,
} from "@/types/auth";
import { prisma } from "@/lib/db";

/**
 * Find user by ID
 * @param id - User ID
 * @returns User data or null if not found
 */
export async function findUserById(id: string): Promise<AuthUser | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Error finding user by ID:", error);
    throw new Error("Failed to find user by ID");
  }
}

/**
 * Find user by email
 * @param email - User email
 * @returns User data or null if not found
 */
export async function findUserByEmail(email: string): Promise<AuthUser | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Error finding user by email:", error);
    throw new Error("Failed to find user by email");
  }
}

/**
 * Create a new user
 * @param data - User creation data
 * @returns Created user data
 */
export async function createUser(data: UserCreateData): Promise<AuthUser> {
  try {
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        emailVerified: data.emailVerified,
        image: data.image,
        role: data.role || "USER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user");
  }
}

/**
 * Update user data
 * @param id - User ID
 * @param data - User update data
 * @returns Updated user data
 */
export async function updateUser(
  id: string,
  data: UserUpdateData,
): Promise<AuthUser> {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        emailVerified: data.emailVerified,
        image: data.image,
        role: data.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update user");
  }
}

/**
 * Delete user
 * @param id - User ID
 * @returns Success status
 */
export async function deleteUser(id: string): Promise<boolean> {
  try {
    await prisma.user.delete({
      where: { id },
    });

    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user");
  }
}

/**
 * Find user by provider account
 * @param provider - Provider name
 * @param providerAccountId - Provider account ID
 * @returns User data or null if not found
 */
export async function findUserByProvider(
  provider: string,
  providerAccountId: string,
): Promise<AuthUser | null> {
  try {
    const account = await prisma.account.findFirst({
      where: {
        provider,
        providerAccountId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            image: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return account?.user || null;
  } catch (error) {
    console.error("Error finding user by provider:", error);
    throw new Error("Failed to find user by provider");
  }
}

/**
 * Update user email verification status
 * @param id - User ID
 * @param emailVerified - Email verification date
 * @returns Updated user data
 */
export async function updateUserVerification(
  id: string,
  emailVerified: Date,
): Promise<AuthUser> {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { emailVerified },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Error updating user verification:", error);
    throw new Error("Failed to update user verification");
  }
}

/**
 * Get user profile with additional information
 * @param id - User ID
 * @returns User profile data
 */
export async function getUserProfile(id: string): Promise<UserProfile | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) return null;

    return {
      ...user,
      isEmailVerified: !!user.emailVerified,
    };
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw new Error("Failed to get user profile");
  }
}

/**
 * Search users by criteria
 * @param criteria - Search criteria
 * @returns Array of matching users
 */
export async function searchUsers(
  criteria: UserSearchCriteria,
): Promise<AuthUser[]> {
  try {
    const where: Record<string, unknown> = {};

    if (criteria.id) where.id = criteria.id;
    if (criteria.email) where.email = criteria.email;
    if (criteria.role) where.role = criteria.role;
    if (criteria.isEmailVerified !== undefined) {
      where.emailVerified = criteria.isEmailVerified ? { not: null } : null;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return users;
  } catch (error) {
    console.error("Error searching users:", error);
    throw new Error("Failed to search users");
  }
}

/**
 * Get user statistics
 * @returns User statistics
 */
export async function getUserStats(): Promise<UserStats> {
  try {
    const [totalUsers, verifiedUsers, adminUsers, recentSignups] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { emailVerified: { not: null } } }),
        prisma.user.count({ where: { role: "ADMIN" } }),
        prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
        }),
      ]);

    return {
      totalUsers,
      verifiedUsers,
      adminUsers,
      recentSignups,
    };
  } catch (error) {
    console.error("Error getting user stats:", error);
    throw new Error("Failed to get user stats");
  }
}

/**
 * Get user activity data
 * @param id - User ID
 * @returns User activity data
 */
export async function getUserActivity(
  id: string,
): Promise<UserActivity | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        accounts: {
          select: {
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!user) return null;

    return {
      userId: user.id,
      lastLoginAt: user.accounts[0]?.createdAt,
      loginCount: user.accounts.length,
      lastActivityAt: user.updatedAt,
    };
  } catch (error) {
    console.error("Error getting user activity:", error);
    throw new Error("Failed to get user activity");
  }
}
