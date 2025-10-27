// Import error types for type guards
import type {
  AuthenticationError,
  AuthError,
  DatabaseError,
  ProviderError,
  SessionError,
  ValidationError,
} from "./errors";

/**
 * Auth Module Type Definitions
 *
 * This module provides comprehensive TypeScript type definitions for the authentication system.
 * It includes types for sessions, users, providers, and error handling.
 *
 * @module types/auth
 */

// Session-related types
export type {
  AuthSession,
  JWTCallbackParams,
  JWTToken,
  Session,
  SessionCallbackParams,
  SessionConfig,
  SessionCreateData,
  SessionUpdateData,
  SessionValidationResult,
  SessionWithUser,
  SessionWithUserData,
} from "./session";

// User-related types
export type {
  AuthUser,
  UserActivity,
  UserAuthResult,
  UserCreateData,
  UserDeletionResult,
  UserPreferences,
  UserProfile,
  UserRegistrationData,
  UserSearchCriteria,
  UserStats,
  UserUpdateData,
  UserVerificationStatus,
} from "./user";

// Provider-related types
export type {
  EmailProviderConfig,
  EmailVerificationParams,
  GoogleProviderConfig,
  OAuthProviderConfig,
  ProviderAccount,
  ProviderAuthResult,
  ProviderCapabilities,
  ProviderConfigMap,
  ProviderLinkData,
  ProviderSelectionCriteria,
  ProviderUnlinkData,
  ResendProviderConfig,
} from "./provider";

// Error-related types
export type {
  AuthenticationError,
  AuthError,
  AuthorizationError,
  ConfigurationError,
  DatabaseError,
  EmailError,
  ErrorCategory,
  ErrorHandlingResult,
  ErrorLogContext,
  ErrorMetrics,
  ErrorRecoveryAction,
  ErrorResponse,
  ErrorSeverity,
  NetworkError,
  ProviderError,
  RateLimitError,
  SessionError,
  ValidationError,
} from "./errors";

// Re-export Prisma types for convenience
export type { UserRole } from "@prisma/client";

// Utility types for auth module
export type AuthModuleConfig = {
  session: {
    strategy: "jwt" | "database";
    maxAge: number;
    updateAge: number;
    generateSessionToken: () => string;
  };
  providers: {
    google: Record<string, unknown>;
    resend: Record<string, unknown>;
  };
  database: {
    adapter: "prisma";
    url: string;
  };
  security: {
    jwtSecret: string;
    sessionMaxAge: number;
    rateLimiting: {
      enabled: boolean;
      maxAttempts: number;
      windowMs: number;
    };
  };
};

// Common response types
export type AuthResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    timestamp: Date;
    userId?: string;
    requestId?: string;
  };
  timestamp: Date;
};

export type AuthServiceResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    requestId: string;
    duration: number;
    timestamp: Date;
  };
};

// Type guards for runtime type checking
export const isAuthError = (error: unknown): error is AuthError => {
  return (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    "message" in error
  );
};

export const isValidationError = (error: unknown): error is ValidationError => {
  return isAuthError(error) && error.code === "VALIDATION_ERROR";
};

export const isAuthenticationError = (
  error: unknown,
): error is AuthenticationError => {
  return isAuthError(error) && error.code === "AUTHENTICATION_ERROR";
};

export const isProviderError = (error: unknown): error is ProviderError => {
  return isAuthError(error) && error.code === "PROVIDER_ERROR";
};

export const isDatabaseError = (error: unknown): error is DatabaseError => {
  return isAuthError(error) && error.code === "DATABASE_ERROR";
};

export const isSessionError = (error: unknown): error is SessionError => {
  return isAuthError(error) && error.code === "SESSION_ERROR";
};

// Constants for error codes
export const AUTH_ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR",
  PROVIDER_ERROR: "PROVIDER_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  SESSION_ERROR: "SESSION_ERROR",
  EMAIL_ERROR: "EMAIL_ERROR",
  RATE_LIMIT_ERROR: "RATE_LIMIT_ERROR",
  CONFIGURATION_ERROR: "CONFIGURATION_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
} as const;

// Constants for error severities
export const ERROR_SEVERITIES = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
} as const;

// Constants for error categories
export const ERROR_CATEGORIES = {
  VALIDATION: "VALIDATION",
  AUTHENTICATION: "AUTHENTICATION",
  AUTHORIZATION: "AUTHORIZATION",
  PROVIDER: "PROVIDER",
  DATABASE: "DATABASE",
  SESSION: "SESSION",
  EMAIL: "EMAIL",
  RATE_LIMIT: "RATE_LIMIT",
  CONFIGURATION: "CONFIGURATION",
  NETWORK: "NETWORK",
  UNKNOWN: "UNKNOWN",
} as const;
