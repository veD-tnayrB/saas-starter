/**
 * Auth Client Module
 *
 * This module provides client interfaces for external services used in authentication.
 * It handles email services, OAuth providers, and other external integrations.
 *
 * @module clients/auth
 */

// Email client exports
export {
  BaseEmailClient,
  EmailTemplateGenerator,
  type EmailClient,
  type EmailConfig,
  type EmailResult,
  type EmailTemplate,
} from "./email";

// Resend client exports
export {
  ResendEmailClient,
  createResendClient,
  getDefaultResendConfig,
} from "./resend";

// OAuth client exports
export {
  BaseOAuthClient,
  GoogleOAuthClient,
  OAuthClientFactory,
  OAuthUtils,
  type OAuthClient,
  type OAuthProviderMap,
  type OAuthTokenResponse,
  type OAuthUserInfoResponse,
} from "./oauth";

// Re-export types for convenience
export type {
  IAuthUser,
  IEmailVerificationParams,
  IProviderAccount,
  IProviderAuthResult,
} from "@/types/auth";

/**
 * Create default email client instance
 */
export function createDefaultEmailClient() {
  const { getDefaultResendConfig, createResendClient } = require("./resend");
  const config = getDefaultResendConfig();
  return createResendClient(config);
}

/**
 * Create default OAuth client for Google
 */
export function createDefaultOAuthClient() {
  const { OAuthClientFactory } = require("./oauth");
  return OAuthClientFactory.createGoogleClient();
}

/**
 * Client factory for creating auth clients
 */
export class AuthClientFactory {
  /**
   * Create email client
   */
  static createEmailClient(provider: "resend" = "resend") {
    switch (provider) {
      case "resend":
        return createDefaultEmailClient();
      default:
        throw new Error(`Unsupported email provider: ${provider}`);
    }
  }

  /**
   * Create OAuth client
   */
  static createOAuthClient(provider: "google" = "google") {
    switch (provider) {
      case "google":
        return createDefaultOAuthClient();
      default:
        throw new Error(`Unsupported OAuth provider: ${provider}`);
    }
  }
}
