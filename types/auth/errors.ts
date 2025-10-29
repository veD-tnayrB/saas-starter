/**
 * Base authentication error interface
 */
export interface IAuthError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
  userId?: string;
  requestId?: string;
}

/**
 * Validation error for input validation failures
 */
export interface IValidationError extends IAuthError {
  code: "VALIDATION_ERROR";
  field?: string;
  value?: unknown;
  constraint?: string;
}

/**
 * Authentication error for login/credential failures
 */
export interface IAuthenticationError extends IAuthError {
  code: "AUTHENTICATION_ERROR";
  reason:
    | "INVALID_CREDENTIALS"
    | "ACCOUNT_DISABLED"
    | "ACCOUNT_LOCKED"
    | "TOKEN_EXPIRED";
  attempts?: number;
  lockoutUntil?: Date;
}

/**
 * Authorization error for permission failures
 */
export interface IAuthorizationError extends IAuthError {
  code: "AUTHORIZATION_ERROR";
  requiredRole?: string;
  requiredPermission?: string;
  resource?: string;
  action?: string;
}

/**
 * Provider error for external service failures
 */
export interface IProviderError extends IAuthError {
  code: "PROVIDER_ERROR";
  provider: string;
  providerError?: Record<string, unknown>;
  retryable: boolean;
  retryAfter?: Date;
}

/**
 * Database error for data access failures
 */
export interface IDatabaseError extends IAuthError {
  code: "DATABASE_ERROR";
  operation: "CREATE" | "READ" | "UPDATE" | "DELETE";
  table?: string;
  constraint?: string;
  retryable: boolean;
}

/**
 * Session error for session management failures
 */
export interface ISessionError extends IAuthError {
  code: "SESSION_ERROR";
  reason:
    | "INVALID_SESSION"
    | "SESSION_EXPIRED"
    | "SESSION_NOT_FOUND"
    | "TOKEN_INVALID";
  sessionId?: string;
  tokenId?: string;
}

/**
 * Email error for email service failures
 */
export interface IEmailError extends IAuthError {
  code: "EMAIL_ERROR";
  emailAddress?: string;
  template?: string;
  provider?: string;
  retryable: boolean;
}

/**
 * Rate limiting error for too many requests
 */
export interface IRateLimitError extends IAuthError {
  code: "RATE_LIMIT_ERROR";
  limit: number;
  remaining: number;
  resetTime: Date;
  retryAfter: Date;
}

/**
 * Configuration error for setup/configuration issues
 */
export interface IConfigurationError extends IAuthError {
  code: "CONFIGURATION_ERROR";
  setting?: string;
  expectedType?: string;
  actualType?: string;
}

/**
 * Network error for connectivity issues
 */
export interface INetworkError extends IAuthError {
  code: "NETWORK_ERROR";
  url?: string;
  method?: string;
  statusCode?: number;
  retryable: boolean;
}

/**
 * Error severity levels
 */
export type ErrorSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

/**
 * Error categories
 */
export type ErrorCategory =
  | "VALIDATION"
  | "AUTHENTICATION"
  | "AUTHORIZATION"
  | "PROVIDER"
  | "DATABASE"
  | "SESSION"
  | "EMAIL"
  | "RATE_LIMIT"
  | "CONFIGURATION"
  | "NETWORK"
  | "UNKNOWN";

/**
 * Error response structure
 */
export interface IErrorResponse {
  error: IAuthError;
  severity: ErrorSeverity;
  category: ErrorCategory;
  retryable: boolean;
  retryAfter?: Date;
  supportContact?: string;
}

/**
 * Error logging context
 */
export interface IErrorLogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  userAgent?: string;
  ipAddress?: string;
  endpoint?: string;
  method?: string;
  timestamp: Date;
}

/**
 * Error handling result
 */
export interface IErrorHandlingResult {
  handled: boolean;
  error?: IAuthError;
  fallback?: Record<string, unknown>;
  shouldRetry: boolean;
  retryAfter?: Date;
}

/**
 * Error recovery action
 */
export interface IErrorRecoveryAction {
  action: "RETRY" | "FALLBACK" | "ABORT" | "ESCALATE";
  delay?: number;
  maxRetries?: number;
  fallbackData?: Record<string, unknown>;
  escalationLevel?: number;
}

/**
 * Error metrics
 */
export interface IErrorMetrics {
  totalErrors: number;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  retryableErrors: number;
  averageRetryTime: number;
  errorRate: number;
  timeWindow: {
    start: Date;
    end: Date;
  };
}

/**
 * Session-specific error
 */
export interface ISessionError extends IAuthError {
  code: "SESSION_ERROR";
  sessionId?: string;
  token?: string;
  expiresAt?: Date;
}

/**
 * User-specific error
 */
export interface IUserError extends IAuthError {
  code: "USER_ERROR";
  userId?: string;
  email?: string;
  operation?: "create" | "update" | "delete" | "find";
}

/**
 * Standardized service response type
 */
export interface IAuthServiceResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: IAuthError;
  timestamp: Date;
}

/**
 * Operation result type
 */
export interface IAuthOperationResult<T = unknown> {
  success: boolean;
  result?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
