// Import error types for type guards
import type {
  IAuthenticationError,
  IAuthError,
  IDatabaseError,
  IProviderError,
  ISessionError,
  IValidationError,
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
  IAuthSession,
  IJWTCallbackParams,
  IJWTToken,
  ISession,
  ISessionCallbackParams,
  ISessionConfig,
  ISessionCreateData,
  ISessionUpdateData,
  ISessionValidationResult,
  ISessionWithUser,
  ISessionWithUserData,
} from "./session";

// User-related types
export type {
  IAuthUser,
  IUserActivity,
  IUserAuthResult,
  IUserCreateData,
  IUserDeletionResult,
  IUserPreferences,
  IUserProfile,
  IUserRegistrationData,
  IUserSearchCriteria,
  IUserStats,
  IUserUpdateData,
  IUserVerificationStatus,
} from "./user";

// Provider-related types
export type {
  IEmailProviderConfig,
  IEmailVerificationParams,
  IGoogleProviderConfig,
  IOAuthProviderConfig,
  IProviderAccount,
  IProviderAuthResult,
  IProviderCapabilities,
  IProviderConfigMap,
  IProviderLinkData,
  IProviderSelectionCriteria,
  IProviderUnlinkData,
  IResendProviderConfig,
} from "./provider";

// Error-related types
export type {
  ErrorCategory,
  ErrorSeverity,
  IAuthenticationError,
  IAuthError,
  IAuthorizationError,
  IConfigurationError,
  IDatabaseError,
  IEmailError,
  IErrorHandlingResult,
  IErrorLogContext,
  IErrorMetrics,
  IErrorRecoveryAction,
  IErrorResponse,
  INetworkError,
  IProviderError,
  IRateLimitError,
  ISessionError,
  IValidationError,
} from "./errors";

// Re-export Prisma types for convenience
export type { UserRole } from "@prisma/client";

// Utility types for auth module
export type IAuthModuleConfig = {
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
export type IAuthResponse<T = any> = {
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

export type IAuthServiceResponse<T = any> = {
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
export const isAuthError = (error: unknown): error is IAuthError => {
  return (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    "message" in error
  );
};

export const isValidationError = (
  error: unknown,
): error is IValidationError => {
  return isAuthError(error) && error.code === "VALIDATION_ERROR";
};

export const isAuthenticationError = (
  error: unknown,
): error is IAuthenticationError => {
  return isAuthError(error) && error.code === "AUTHENTICATION_ERROR";
};

export const isProviderError = (error: unknown): error is IProviderError => {
  return isAuthError(error) && error.code === "PROVIDER_ERROR";
};

export const isDatabaseError = (error: unknown): error is IDatabaseError => {
  return isAuthError(error) && error.code === "DATABASE_ERROR";
};

export const isSessionError = (error: unknown): error is ISessionError => {
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
