import "server-only";

import { cache } from "react";
import NextAuth from "@/auth";
import { getServerSession } from "next-auth";

import type {
  ISessionCreateData,
  ISessionUpdateData,
  ISessionValidationResult,
  ISessionWithUserData,
} from "@/types/auth";
import { prisma } from "@/lib/db";

/**
 * Find session by ID
 * @param id - Session ID
 * @returns Session data or null if not found
 */
export async function findSessionById(
  id: string,
): Promise<ISessionWithUserData | null> {
  try {
    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            image: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return session;
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
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            image: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return session;
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
    const sessions = await prisma.session.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            image: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { expires: "desc" },
    });

    return sessions;
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
    const session = await prisma.session.create({
      data: {
        userId: data.userId,
        expires: data.expiresAt,
        sessionToken: data.sessionToken || generateSessionToken(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            image: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return session;
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
    const session = await prisma.session.update({
      where: { id },
      data: {
        expires: data.expiresAt,
        sessionToken: data.sessionToken,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            image: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return session;
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
    await prisma.session.delete({
      where: { id },
    });

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
    await prisma.session.delete({
      where: { sessionToken },
    });

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
    const result = await prisma.session.deleteMany({
      where: { userId },
    });

    return result.count;
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
    const result = await prisma.session.deleteMany({
      where: {
        expires: {
          lt: new Date(),
        },
      },
    });

    return result.count;
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
    const [totalSessions, activeSessions, expiredSessions] = await Promise.all([
      prisma.session.count(),
      prisma.session.count({
        where: {
          expires: {
            gt: new Date(),
          },
        },
      }),
      prisma.session.count({
        where: {
          expires: {
            lt: new Date(),
          },
        },
      }),
    ]);

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
 * Get current user from session (legacy function for compatibility)
 * @returns Current user data or undefined if not authenticated
 */
export const getCurrentUser = cache(async () => {
  const session = await getServerSession(NextAuth);
  if (!session?.user) {
    return undefined;
  }

  // Return session user directly to avoid database calls in Edge Runtime
  // The session already contains the necessary user information
  return session.user;
});
