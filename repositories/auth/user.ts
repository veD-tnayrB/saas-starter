import { randomUUID } from "crypto";
import { sql } from "kysely";

import type {
  IAuthUser,
  IUserActivity,
  IUserCreateData,
  IUserProfile,
  IUserSearchCriteria,
  IUserStats,
  IUserUpdateData,
} from "@/types/auth";
import { db } from "@/lib/db";

/**
 * Find user by ID
 * @param id - User ID
 * @returns User data or null if not found
 */
export async function findUserById(id: string): Promise<IAuthUser | null> {
  try {
    const result = await sql<IAuthUser>`
      SELECT 
        id,
        name,
        email,
        email_verified AS emailVerified,
        image,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM users
      WHERE id = ${id}
      LIMIT 1
    `.execute(db);

    const row = result.rows[0];
    if (!row) return null;

    return row;
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
export async function findUserByEmail(
  email: string,
): Promise<IAuthUser | null> {
  try {
    const result = await sql<IAuthUser>`
      SELECT 
        id,
        name,
        email,
        email_verified AS emailVerified,
        image,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `.execute(db);

    const row = result.rows[0];
    if (!row) return null;

    return row;
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
export async function createUser(data: IUserCreateData): Promise<IAuthUser> {
  try {
    // Generate a UUID for the user ID
    const id = randomUUID();

    const result = await sql<IAuthUser>`
      INSERT INTO users (id, name, email, email_verified, image, created_at, updated_at)
      VALUES (
        ${id},
        ${data.name ?? null},
        ${data.email},
        ${data.emailVerified ?? null},
        ${data.image ?? null},
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      RETURNING 
        id,
        name,
        email,
        email_verified AS emailVerified,
        image,
        created_at AS createdAt,
        updated_at AS updatedAt
    `.execute(db);

    const row = result.rows[0];
    if (!row) throw new Error("Failed to create user");

    return row;
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
  data: IUserUpdateData,
): Promise<IAuthUser> {
  try {
    // Build SET clause parts conditionally using sql fragments with parameters
    const setParts = [sql.raw("updated_at = CURRENT_TIMESTAMP")];

    if (data.name !== undefined) {
      setParts.push(sql`name = ${data.name ?? null}`);
    }
    if (data.email !== undefined) {
      setParts.push(sql`email = ${data.email ?? null}`);
    }
    if (data.emailVerified !== undefined) {
      setParts.push(sql`email_verified = ${data.emailVerified ?? null}`);
    }
    if (data.image !== undefined) {
      setParts.push(sql`image = ${data.image ?? null}`);
    }

    // Combine all SET parts
    const setClause = sql.join(setParts, sql`, `);

    const result = await sql<IAuthUser>`
      UPDATE users
      SET ${setClause}
      WHERE id = ${id}
      RETURNING 
        id,
        name,
        email,
        email_verified AS emailVerified,
        image,
        created_at AS createdAt,
        updated_at AS updatedAt
    `.execute(db);

    const row = result.rows[0];
    if (!row) throw new Error("User not found");

    return row;
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
    await sql`
      DELETE FROM users
      WHERE id = ${id}
    `.execute(db);

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
): Promise<IAuthUser | null> {
  try {
    const result = await sql<IAuthUser>`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.email_verified AS emailVerified,
        u.image,
        u.created_at AS createdAt,
        u.updated_at AS updatedAt
      FROM users u
      INNER JOIN accounts a ON a.user_id = u.id
      WHERE a.provider = ${provider}
        AND a.provider_account_id = ${providerAccountId}
      LIMIT 1
    `.execute(db);

    const row = result.rows[0];
    if (!row) return null;

    return row;
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
): Promise<IAuthUser> {
  try {
    const result = await sql<IAuthUser>`
      UPDATE users
      SET 
        email_verified = ${emailVerified},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING 
        id,
        name,
        email,
        email_verified AS emailVerified,
        image,
        created_at AS createdAt,
        updated_at AS updatedAt
    `.execute(db);

    const row = result.rows[0];
    if (!row) throw new Error("User not found");

    return row;
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
export async function getUserProfile(id: string): Promise<IUserProfile | null> {
  try {
    const result = await sql<{
      id: string;
      name: string | null;
      email: string | null;
      email_verified: Date | null;
      image: string | null;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT 
        id,
        name,
        email,
        email_verified,
        image,
        created_at,
        updated_at
      FROM users
      WHERE id = ${id}
      LIMIT 1
    `.execute(db);

    const row = result.rows[0];
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      image: row.image,
      isEmailVerified: !!row.email_verified,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
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
  criteria: IUserSearchCriteria,
): Promise<IAuthUser[]> {
  try {
    // Build WHERE clause with proper parameterization
    let whereClause = "";
    const conditions: string[] = [];

    if (criteria.id) {
      conditions.push(`id = ${sql.lit(criteria.id)}`);
    }
    if (criteria.email) {
      conditions.push(`email = ${sql.lit(criteria.email)}`);
    }
    if (criteria.isEmailVerified !== undefined) {
      if (criteria.isEmailVerified) {
        conditions.push(`email_verified IS NOT NULL`);
      } else {
        conditions.push(`email_verified IS NULL`);
      }
    }

    if (conditions.length > 0) {
      whereClause = `WHERE ${conditions.join(" AND ")}`;
    }

    const result = await sql<IAuthUser>`
      SELECT 
        id,
        name,
        email,
        email_verified AS emailVerified,
        image,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM users
      ${sql.raw(whereClause)}
      ORDER BY created_at DESC
    `.execute(db);

    return result.rows;
  } catch (error) {
    console.error("Error searching users:", error);
    throw new Error("Failed to search users");
  }
}

/**
 * Get user statistics
 * @returns User statistics
 */
export async function getUserStats(): Promise<IUserStats> {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalUsersResult, verifiedUsersResult, recentSignupsResult] =
      await Promise.all([
        sql<{ count: string }>`
          SELECT COUNT(*)::text as count
          FROM users
        `.execute(db),
        sql<{ count: string }>`
          SELECT COUNT(*)::text as count
          FROM users
          WHERE email_verified IS NOT NULL
        `.execute(db),
        sql<{ count: string }>`
          SELECT COUNT(*)::text as count
          FROM users
          WHERE created_at >= ${thirtyDaysAgo}
        `.execute(db),
      ]);

    const totalUsers = parseInt(totalUsersResult.rows[0]?.count || "0", 10);
    const verifiedUsers = parseInt(
      verifiedUsersResult.rows[0]?.count || "0",
      10,
    );
    // Admin users are determined by project ownership/admin roles, not a global user role
    const adminUsers = 0;
    const recentSignups = parseInt(
      recentSignupsResult.rows[0]?.count || "0",
      10,
    );

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
 * Get user basic info by email (legacy function for email verification)
 * @param email - User email
 * @returns Basic user info or null if not found
 */
export async function getUserBasicInfoByEmail(email: string): Promise<{
  name: string | null;
  emailVerified: Date | null;
} | null> {
  try {
    const result = await sql<{
      name: string | null;
      emailVerified: Date | null;
    }>`
      SELECT 
        name,
        email_verified AS emailVerified
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `.execute(db);

    const row = result.rows[0];
    if (!row) return null;

    return row;
  } catch (error) {
    console.error("Error getting user basic info by email:", error);
    return null;
  }
}

/**
 * Get user activity data
 * @param id - User ID
 * @returns User activity data
 */
export async function getUserActivity(
  id: string,
): Promise<IUserActivity | null> {
  try {
    const userResult = await sql<{
      id: string;
      createdAt: Date;
      updatedAt: Date;
    }>`
      SELECT 
        id,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM users
      WHERE id = ${id}
      LIMIT 1
    `.execute(db);

    const user = userResult.rows[0];
    if (!user) return null;

    const accountsResult = await sql<{
      createdAt: Date;
    }>`
      SELECT created_at AS createdAt
      FROM accounts
      WHERE user_id = ${id}
      ORDER BY created_at DESC
    `.execute(db);

    return {
      userId: user.id,
      lastLoginAt: accountsResult.rows[0]?.createdAt || null,
      loginCount: accountsResult.rows.length,
      lastActivityAt: user.updatedAt,
    };
  } catch (error) {
    console.error("Error getting user activity:", error);
    throw new Error("Failed to get user activity");
  }
}
