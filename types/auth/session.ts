import { UserRole } from "@prisma/client";
import type { DefaultSession } from "next-auth";

// Import types to avoid duplications
import type { AuthError } from "./errors";
import type { AuthUser } from "./user";

/**
 * Extended session interface for NextAuth
 * Extends the default session with user role information
 */
export interface AuthSession extends DefaultSession {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: UserRole;
  };
  expires: string;
}

/**
 * JWT token structure used in NextAuth callbacks
 */
export interface JWTToken {
  sub?: string;
  name?: string | null;
  email?: string | null;
  picture?: string | null;
  role?: UserRole;
  iat?: number;
  exp?: number;
}

/**
 * Session callback parameters from NextAuth
 */
export interface SessionCallbackParams {
  token: JWTToken;
  session: AuthSession;
}

/**
 * JWT callback parameters from NextAuth
 */
export interface JWTCallbackParams {
  token: JWTToken;
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: UserRole;
  };
  account?: {
    provider: string;
    type: string;
    providerAccountId: string;
    access_token?: string;
    refresh_token?: string;
    expires_at?: number;
  };
}

/**
 * Session validation result
 */
export interface SessionValidationResult {
  isValid: boolean;
  user?: AuthUser;
  error?: AuthError;
  expiresAt?: Date;
}

/**
 * Session configuration options
 */
export interface SessionConfig {
  strategy: "jwt" | "database";
  maxAge: number;
  updateAge: number;
  generateSessionToken: () => string;
}

/**
 * Session creation data
 */
export interface SessionCreateData {
  userId: string;
  expiresAt: Date;
  sessionToken?: string;
}

/**
 * Session update data
 */
export interface SessionUpdateData {
  expiresAt?: Date;
  sessionToken?: string;
}

export interface Session {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionWithUser extends Session {
  user: AuthUser;
}

export interface SessionWithUserData {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
  user: AuthUser;
}
