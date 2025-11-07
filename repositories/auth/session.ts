import "server-only";

import { randomUUID } from "crypto";
import { sql } from "kysely";

import type {
  IAuthUser,
  ISessionCreateData,
  ISessionUpdateData,
  ISessionValidationResult,
  ISessionWithUserData,
} from "@/types/auth";
import { db } from "@/lib/db";

/**
 * Find session by ID
 * @param id - Session ID
 * @returns Session data or null if not found
 */
export async function findSessionById(
  id: string,
): Promise<ISessionWithUserData | null> {
  try {
    const result = await sql<{
      id: string;
      sessionToken: string;
      userId: string;
      expires: Date;
      userId2: string;
      userName: string | null;
      userEmail: string | null;
      userEmailVerified: Date | null;
      userImage: string | null;
      userCreatedAt: Date;
      userUpdatedAt: Date;
    }>`
      SELECT 
        s.id,
        s.session_token AS "sessionToken",
        s.user_id AS "userId",
        s.expires,
        u.id AS "userId2",
        u.name AS "userName",
        u.email AS "userEmail",
        u.email_verified AS "userEmailVerified",
        u.image AS "userImage",
        u.created_at AS "userCreatedAt",
        u.updated_at AS "userUpdatedAt"
      FROM sessions s
      INNER JOIN users u ON u.id = s.user_id
      WHERE s.id = ${id}
      LIMIT 1
    `.execute(db);

    const row = result.rows[0];
    if (!row) return null;

    return {
      id: row.id,
      sessionToken: row.sessionToken,
      userId: row.userId,
      expires: row.expires,
      user: {
        id: row.userId2,
        name: row.userName,
        email: row.userEmail,
        emailVerified: row.userEmailVerified,
        image: row.userImage,
        createdAt: row.userCreatedAt,
        updatedAt: row.userUpdatedAt,
      },
    };
  } catch (error) {
    console.error("Error finding session by ID:", error);
    throw new Error("Failed to find session by ID");
  }
}

/**
 * Find session by session token
 * @param sessionToken - Session token
 * @returns Session data or null if not found
 */
export async function findSessionByToken(
  sessionToken: string,
): Promise<ISessionWithUserData | null> {
  try {
    const result = await sql<{
      id: string;
      sessionToken: string;
      userId: string;
      expires: Date;
      userId2: string;
      userName: string | null;
      userEmail: string | null;
      userEmailVerified: Date | null;
      userImage: string | null;
      userCreatedAt: Date;
      userUpdatedAt: Date;
    }>`
      SELECT 
        s.id,
        s.session_token AS "sessionToken",
        s.user_id AS "userId",
        s.expires,
        u.id AS "userId2",
        u.name AS "userName",
        u.email AS "userEmail",
        u.email_verified AS "userEmailVerified",
        u.image AS "userImage",
        u.created_at AS "userCreatedAt",
        u.updated_at AS "userUpdatedAt"
      FROM sessions s
      INNER JOIN users u ON u.id = s.user_id
      WHERE s.session_token = ${sessionToken}
      LIMIT 1
    `.execute(db);

    const row = result.rows[0];
    if (!row) return null;

    return {
      id: row.id,
      sessionToken: row.sessionToken,
      userId: row.userId,
      expires: row.expires,
      user: {
        id: row.userId2,
        name: row.userName,
        email: row.userEmail,
        emailVerified: row.userEmailVerified,
        image: row.userImage,
        createdAt: row.userCreatedAt,
        updatedAt: row.userUpdatedAt,
      },
    };
  } catch (error) {
    console.error("Error finding session by token:", error);
    throw new Error("Failed to find session by token");
  }
}

/**
 * Find sessions by user ID
 * @param userId - User ID
 * @returns Array of user sessions
 */
export async function findSessionsByUserId(
  userId: string,
): Promise<ISessionWithUserData[]> {
  try {
    const result = await sql<{
      id: string;
      sessionToken: string;
      userId: string;
      expires: Date;
      userId2: string;
      userName: string | null;
      userEmail: string | null;
      userEmailVerified: Date | null;
      userImage: string | null;
      userCreatedAt: Date;
      userUpdatedAt: Date;
    }>`
      SELECT 
        s.id,
        s.session_token AS "sessionToken",
        s.user_id AS "userId",
        s.expires,
        u.id AS "userId2",
        u.name AS "userName",
        u.email AS "userEmail",
        u.email_verified AS "userEmailVerified",
        u.image AS "userImage",
        u.created_at AS "userCreatedAt",
        u.updated_at AS "userUpdatedAt"
      FROM sessions s
      INNER JOIN users u ON u.id = s.user_id
      WHERE s.user_id = ${userId}
      ORDER BY s.expires DESC
    `.execute(db);

    return result.rows.map((row) => ({
      id: row.id,
      sessionToken: row.sessionToken,
      userId: row.userId,
      expires: row.expires,
      user: {
        id: row.userId2,
        name: row.userName,
        email: row.userEmail,
        emailVerified: row.userEmailVerified,
        image: row.userImage,
        createdAt: row.userCreatedAt,
        updatedAt: row.userUpdatedAt,
      },
    }));
  } catch (error) {
    console.error("Error finding sessions by user ID:", error);
    throw new Error("Failed to find sessions by user ID");
  }
}

/**
 * Create a new session
 * @param data - Session creation data
 * @returns Created session data
 */
export async function createSession(
  data: ISessionCreateData,
): Promise<ISessionWithUserData> {
  try {
    const id = randomUUID();
    const sessionToken = data.sessionToken || generateSessionToken();

    const sessionResult = await sql<{
      id: string;
      sessionToken: string;
      userId: string;
      expires: Date;
    }>`
      INSERT INTO sessions (id, session_token, user_id, expires)
      VALUES (${id}, ${sessionToken}, ${data.userId}, ${data.expiresAt})
      RETURNING 
        id,
        session_token AS "sessionToken",
        user_id AS "userId",
        expires
    `.execute(db);

    const session = sessionResult.rows[0];
    if (!session) throw new Error("Failed to create session");

    // Fetch user data
    const userResult = await sql<IAuthUser>`
      SELECT 
        id,
        name,
        email,
        email_verified AS "emailVerified",
        image,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM users
      WHERE id = ${data.userId}
      LIMIT 1
    `.execute(db);

    const user = userResult.rows[0];
    if (!user) throw new Error("User not found");

    return {
      id: session.id,
      sessionToken: session.sessionToken,
      userId: session.userId,
      expires: session.expires,
      user,
    };
  } catch (error) {
    console.error("Error creating session:", error);
    throw new Error("Failed to create session");
  }
}

/**
 * Update session data
 * @param id - Session ID
 * @param data - Session update data
 * @returns Updated session data
 */
export async function updateSession(
  id: string,
  data: ISessionUpdateData,
): Promise<ISessionWithUserData> {
  try {
    // Build SET clause parts using sql fragments for proper sanitization
    const setParts: ReturnType<typeof sql>[] = [];
    if (data.expiresAt !== undefined) {
      setParts.push(sql`expires = ${data.expiresAt}`);
    }
    if (data.sessionToken !== undefined) {
      setParts.push(sql`session_token = ${data.sessionToken}`);
    }

    if (setParts.length === 0) {
      // No updates, just fetch existing session
      const existing = await findSessionById(id);
      if (!existing) throw new Error("Session not found");
      return existing;
    }

    // Combine all SET parts safely
    const setClause = sql.join(setParts, sql`, `);

    const sessionResult = await sql<{
      id: string;
      sessionToken: string;
      userId: string;
      expires: Date;
    }>`
      UPDATE sessions
      SET ${setClause}
      WHERE id = ${id}
      RETURNING 
        id,
        session_token AS "sessionToken",
        user_id AS "userId",
        expires
    `.execute(db);

    const session = sessionResult.rows[0];
    if (!session) throw new Error("Session not found");

    // Fetch user data
    const userResult = await sql<IAuthUser>`
      SELECT 
        id,
        name,
        email,
        email_verified AS "emailVerified",
        image,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM users
      WHERE id = ${session.userId}
      LIMIT 1
    `.execute(db);

    const user = userResult.rows[0];
    if (!user) throw new Error("User not found");

    return {
      id: session.id,
      sessionToken: session.sessionToken,
      userId: session.userId,
      expires: session.expires,
      user,
    };
  } catch (error) {
    console.error("Error updating session:", error);
    throw new Error("Failed to update session");
  }
}

/**
 * Delete session
 * @param id - Session ID
 * @returns Success status
 */
export async function deleteSession(id: string): Promise<boolean> {
  try {
    await sql`
      DELETE FROM sessions
      WHERE id = ${id}
    `.execute(db);

    return true;
  } catch (error) {
    console.error("Error deleting session:", error);
    throw new Error("Failed to delete session");
  }
}

/**
 * Delete session by token
 * @param sessionToken - Session token
 * @returns Success status
 */
export async function deleteSessionByToken(
  sessionToken: string,
): Promise<boolean> {
  try {
    await sql`
      DELETE FROM sessions
      WHERE session_token = ${sessionToken}
    `.execute(db);

    return true;
  } catch (error) {
    console.error("Error deleting session by token:", error);
    throw new Error("Failed to delete session by token");
  }
}

/**
 * Delete all sessions for a user
 * @param userId - User ID
 * @returns Number of deleted sessions
 */
export async function deleteUserSessions(userId: string): Promise<number> {
  try {
    const result = await sql<{ id: string }>`
      DELETE FROM sessions
      WHERE user_id = ${userId}
      RETURNING id
    `.execute(db);

    return result.rows.length;
  } catch (error) {
    console.error("Error deleting user sessions:", error);
    throw new Error("Failed to delete user sessions");
  }
}

/**
 * Validate session
 * @param sessionToken - Session token
 * @returns Session validation result
 */
export async function validateSession(
  sessionToken: string,
): Promise<ISessionValidationResult> {
  try {
    const session = await findSessionByToken(sessionToken);

    if (!session) {
      return {
        isValid: false,
        error: {
          code: "SESSION_NOT_FOUND",
          message: "Session not found",
          timestamp: new Date(),
        },
      };
    }

    if (session.expires < new Date()) {
      return {
        isValid: false,
        error: {
          code: "SESSION_EXPIRED",
          message: "Session has expired",
          timestamp: new Date(),
        },
        expiresAt: session.expires,
      };
    }

    return {
      isValid: true,
      user: session.user,
      expiresAt: session.expires,
    };
  } catch (error) {
    console.error("Error validating session:", error);
    return {
      isValid: false,
      error: {
        code: "SESSION_VALIDATION_ERROR",
        message: "Failed to validate session",
        timestamp: new Date(),
      },
    };
  }
}

/**
 * Clean up expired sessions
 * @returns Number of deleted sessions
 */
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const now = new Date();

    const result = await sql<{ id: string }>`
      DELETE FROM sessions
      WHERE expires < ${now}
      RETURNING id
    `.execute(db);

    return result.rows.length;
  } catch (error) {
    console.error("Error cleaning up expired sessions:", error);
    throw new Error("Failed to cleanup expired sessions");
  }
}

/**
 * Get session statistics
 * @returns Session statistics
 */
export async function getSessionStats(): Promise<{
  totalSessions: number;
  activeSessions: number;
  expiredSessions: number;
}> {
  try {
    const now = new Date();

    const [totalSessionsResult, activeSessionsResult, expiredSessionsResult] =
      await Promise.all([
        sql<{ count: string }>`
          SELECT COUNT(*)::text as count
          FROM sessions
        `.execute(db),
        sql<{ count: string }>`
          SELECT COUNT(*)::text as count
          FROM sessions
          WHERE expires > ${now}
        `.execute(db),
        sql<{ count: string }>`
          SELECT COUNT(*)::text as count
          FROM sessions
          WHERE expires < ${now}
        `.execute(db),
      ]);

    const totalSessions = parseInt(
      totalSessionsResult.rows[0]?.count || "0",
      10,
    );
    const activeSessions = parseInt(
      activeSessionsResult.rows[0]?.count || "0",
      10,
    );
    const expiredSessions = parseInt(
      expiredSessionsResult.rows[0]?.count || "0",
      10,
    );

    return {
      totalSessions,
      activeSessions,
      expiredSessions,
    };
  } catch (error) {
    console.error("Error getting session stats:", error);
    throw new Error("Failed to get session stats");
  }
}

/**
 * Generate a secure session token
 * @returns Generated session token
 */
function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

/**
 * @deprecated Use getCurrentUser from @/lib/session instead
 * This function is kept for backward compatibility but will be removed in a future version
 */
export { getCurrentUser } from "@/lib/session";
