import type { DefaultSession } from "next-auth";

// Import types to avoid duplications
import type { IAuthError } from "./errors";
import type { IAuthUser } from "./user";

/**
 * Extended session interface for NextAuth
 */
export interface IAuthSession extends DefaultSession {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  expires: string;
}

/**
 * JWT token structure used in NextAuth callbacks
 */
export interface IJWTToken {
  sub?: string;
  name?: string | null;
  email?: string | null;
  picture?: string | null;
  iat?: number;
  exp?: number;
}

/**
 * Session callback parameters from NextAuth
 */
export interface ISessionCallbackParams {
  token: IJWTToken;
  session: IAuthSession;
}

/**
 * JWT callback parameters from NextAuth
 */
export interface IJWTCallbackParams {
  token: IJWTToken;
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
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
export interface ISessionValidationResult {
  isValid: boolean;
  user?: IAuthUser;
  error?: IAuthError;
  expiresAt?: Date;
}

/**
 * Session configuration options
 */
export interface ISessionConfig {
  strategy: "jwt" | "database";
  maxAge: number;
  updateAge: number;
  generateSessionToken: () => string;
}

/**
 * Session creation data
 */
export interface ISessionCreateData {
  userId: string;
  expiresAt: Date;
  sessionToken?: string;
}

/**
 * Session update data
 */
export interface ISessionUpdateData {
  expiresAt?: Date;
  sessionToken?: string;
}

export interface ISession {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISessionWithUser extends ISession {
  user: IAuthUser;
}

export interface ISessionWithUserData {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
  user: IAuthUser;
}
