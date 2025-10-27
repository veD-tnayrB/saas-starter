// Import types to avoid duplications
import type { AuthUser } from "./user";

/**
 * OAuth provider configuration
 */
export interface OAuthProviderConfig {
  id: string;
  name: string;
  type: "oauth";
  clientId: string;
  clientSecret: string;
  authorization?: {
    url: string;
    params?: Record<string, string>;
  };
  token?: {
    url: string;
    params?: Record<string, string>;
  };
  userinfo?: {
    url: string;
    params?: Record<string, string>;
  };
  profile?: (profile: Record<string, unknown>) => {
    id: string;
    name?: string;
    email?: string;
    image?: string;
  };
}

/**
 * Email provider configuration
 */
export interface EmailProviderConfig {
  id: string;
  name: string;
  type: "email";
  server: {
    host: string;
    port: number;
    auth: {
      user: string;
      pass: string;
    };
  };
  from: string;
  sendVerificationRequest: (params: EmailVerificationParams) => Promise<void>;
}

/**
 * Email verification request parameters
 */
export interface EmailVerificationParams {
  identifier: string;
  url: string;
  provider: EmailProviderConfig;
  theme?: {
    colorScheme?: "auto" | "dark" | "light";
    logo?: string;
    brandColor?: string;
    buttonText?: string;
  };
}

/**
 * Provider account data
 */
export interface ProviderAccount {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string | null;
  access_token?: string | null;
  expires_at?: number | null;
  token_type?: string | null;
  scope?: string | null;
  id_token?: string | null;
  session_state?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Provider linking data
 */
export interface ProviderLinkData {
  userId: string;
  provider: string;
  providerAccountId: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
}

/**
 * Provider unlinking data
 */
export interface ProviderUnlinkData {
  userId: string;
  provider: string;
}

/**
 * Provider authentication result
 */
export interface ProviderAuthResult {
  success: boolean;
  user?: AuthUser;
  account?: ProviderAccount;
  error?: string;
  isNewUser?: boolean;
}

/**
 * Google OAuth provider specific configuration
 */
export interface GoogleProviderConfig extends OAuthProviderConfig {
  id: "google";
  name: "Google";
  clientId: string;
  clientSecret: string;
}

/**
 * Resend email provider specific configuration
 */
export interface ResendProviderConfig extends EmailProviderConfig {
  id: "resend";
  name: "Resend";
  apiKey: string;
  from: string;
}

/**
 * Provider configuration map
 */
export interface ProviderConfigMap {
  google: GoogleProviderConfig;
  resend: ResendProviderConfig;
}

/**
 * Provider selection criteria
 */
export interface ProviderSelectionCriteria {
  type?: "oauth" | "email";
  supportedFeatures?: string[];
  userPreference?: string;
}

/**
 * Provider capabilities
 */
export interface ProviderCapabilities {
  supportsOAuth: boolean;
  supportsEmail: boolean;
  supportsPasswordReset: boolean;
  supportsAccountLinking: boolean;
  supportsProfileUpdates: boolean;
}
