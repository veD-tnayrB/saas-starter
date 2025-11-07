import {
  createSession,
  deleteSession,
  deleteUserSessions,
  findUserById,
  validateSession,
} from "@/repositories/auth";
import { isPlatformAdmin } from "@/services/auth/platform-admin";
import type { User } from "next-auth";
import type { JWT } from "next-auth/jwt";

import type {
  IAuthSession,
  IAuthUser,
  ISessionCreateData,
  ISessionValidationResult,
} from "@/types/auth";

/**
 * Session service for managing user sessions
 */
export class SessionService {
  /**
   * Create a new session for a user
   */
  async createUserSession(userId: string): Promise<IAuthSession> {
    try {
      // Verify user exists
      const user = await findUserById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Create session data
      const sessionData: ISessionCreateData = {
        userId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      };

      // Create session in database
      const session = await createSession(sessionData);

      // Return auth session format
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
        expires: session.expires.toISOString(),
      };
    } catch (error) {
      console.error("Error creating user session:", error);
      throw new Error("Failed to create user session");
    }
  }

  /**
   * Validate a session token
   */
  async validateUserSession(
    sessionToken: string,
  ): Promise<ISessionValidationResult> {
    try {
      return await validateSession(sessionToken);
    } catch (error) {
      console.error("Error validating user session:", error);
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
   * Refresh a session
   */
  async refreshUserSession(sessionToken: string): Promise<IAuthSession | null> {
    try {
      const validation = await this.validateUserSession(sessionToken);

      if (!validation.isValid || !validation.user) {
        return null;
      }

      // Create new session with extended expiry
      return await this.createUserSession(validation.user.id);
    } catch (error) {
      console.error("Error refreshing user session:", error);
      return null;
    }
  }

  /**
   * Destroy a session
   */
  async destroyUserSession(sessionToken: string): Promise<boolean> {
    try {
      return await deleteSession(sessionToken);
    } catch (error) {
      console.error("Error destroying user session:", error);
      return false;
    }
  }

  /**
   * Destroy all sessions for a user
   */
  async destroyAllUserSessions(userId: string): Promise<number> {
    try {
      return await deleteUserSessions(userId);
    } catch (error) {
      console.error("Error destroying all user sessions:", error);
      return 0;
    }
  }

  /**
   * Get user from session token
   */
  async getUserFromSession(sessionToken: string): Promise<IAuthUser | null> {
    try {
      const validation = await this.validateUserSession(sessionToken);
      return validation.isValid ? validation.user || null : null;
    } catch (error) {
      console.error("Error getting user from session:", error);
      return null;
    }
  }
}

/**
 * JWT service for handling JWT tokens in NextAuth
 */
export class JWTService {
  /**
   * Create JWT token from user data
   */
  createJWTToken(user: IAuthUser): JWT {
    return {
      sub: user.id,
      name: user.name,
      email: user.email,
      picture: user.image,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
    };
  }

  /**
   * Validate JWT token
   */
  async validateJWTToken(token: JWT): Promise<{
    isValid: boolean;
    user?: IAuthUser;
    error?: string;
  }> {
    try {
      // Check if token is expired
      if (
        token.exp &&
        typeof token.exp === "number" &&
        token.exp < Math.floor(Date.now() / 1000)
      ) {
        return {
          isValid: false,
          error: "Token expired",
        };
      }

      // Check if user still exists
      if (!token.sub) {
        return {
          isValid: false,
          error: "Invalid token: missing user ID",
        };
      }

      const user = await findUserById(token.sub);
      if (!user) {
        return {
          isValid: false,
          error: "User not found",
        };
      }

      return {
        isValid: true,
        user,
      };
    } catch (error) {
      console.error("Error validating JWT token:", error);
      return {
        isValid: false,
        error: "Token validation failed",
      };
    }
  }

  /**
   * Refresh JWT token
   */
  async refreshJWTToken(token: JWT): Promise<JWT | null> {
    try {
      const validation = await this.validateJWTToken(token);

      if (!validation.isValid || !validation.user) {
        return null;
      }

      return this.createJWTToken(validation.user);
    } catch (error) {
      console.error("Error refreshing JWT token:", error);
      return null;
    }
  }
}

/**
 * Session management service
 */
export class SessionManagementService {
  private sessionService: SessionService;
  private jwtService: JWTService;

  constructor() {
    this.sessionService = new SessionService();
    this.jwtService = new JWTService();
  }

  /**
   * Handle NextAuth session callback
   */
  async handleSessionCallback(token: JWT, session: any): Promise<any> {
    try {
      // Use token data directly to avoid database calls in Edge Runtime
      // The token should already contain the necessary user information
      if (!token.sub) {
        return session;
      }

      // Update session with token data
      return {
        ...session,
        user: {
          id: token.sub,
          name: token.name,
          email: token.email,
          image: token.picture,
        },
        expires:
          token.exp && typeof token.exp === "number"
            ? new Date(token.exp * 1000)
            : session.expires,
      };
    } catch (error) {
      console.error("Error in session callback:", error);
      return session;
    }
  }

  /**
   * Handle NextAuth JWT callback
   */
  async handleJWTCallback(
    token: JWT,
    user?: User,
    trigger?: string,
    session?: any,
  ): Promise<JWT | null> {
    try {
      // If user is provided (during sign in), update token with user info
      if (user) {
        return {
          ...token,
          sub: user.id,
          name: user.name,
          email: user.email,
          picture: user.image,
        };
      }

      // If trigger is "update", fetch the latest user data from database
      if (trigger === "update" && token.sub) {
        try {
          // Import user service to get fresh user data
          const { userService } = await import("./user");
          const freshUser = await userService.getUserById(token.sub);

          if (freshUser) {
            return {
              ...token,
              name: freshUser.name,
              email: freshUser.email,
              picture: freshUser.image,
            };
          }
        } catch (error) {
          console.error(
            "Error fetching fresh user data in JWT callback:",
            error,
          );
          // Continue with existing token data if fetch fails
        }
      }

      // If token exists, return it as-is
      return token;
    } catch (error) {
      console.error("Error in JWT callback:", error);
      return token; // Return the existing token instead of null
    }
  }

  /**
   * Get current user from session
   */
  async getCurrentUser(sessionToken?: string): Promise<IAuthUser | null> {
    try {
      if (!sessionToken) {
        return null;
      }

      return await this.sessionService.getUserFromSession(sessionToken);
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(sessionToken?: string): Promise<boolean> {
    try {
      if (!sessionToken) {
        return false;
      }

      const validation =
        await this.sessionService.validateUserSession(sessionToken);
      return validation.isValid;
    } catch (error) {
      console.error("Error checking authentication status:", error);
      return false;
    }
  }

  /**
   * Check if user is platform admin (owner/admin of any project)
   */
  async isAdmin(sessionToken: string): Promise<boolean> {
    try {
      const user = await this.getCurrentUser(sessionToken);
      if (!user) return false;

      return await isPlatformAdmin(user.id);
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  }
}

// Export singleton instances
export const sessionService = new SessionService();
export const jwtService = new JWTService();
export const sessionManagementService = new SessionManagementService();
