// Import types to avoid duplications
import type { IAuthUser } from "./user";

/**
 * OAuth provider configuration
 */
export interface IOAuthProviderConfig {
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
export interface IEmailProviderConfig {
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
  sendVerificationRequest: (params: IEmailVerificationParams) => Promise<void>;
}

/**
 * Email verification request parameters
 */
export interface IEmailVerificationParams {
  identifier: string;
  url: string;
  provider: IEmailProviderConfig;
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
export interface IProviderAccount {
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
export interface IProviderLinkData {
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
export interface IProviderUnlinkData {
  userId: string;
  provider: string;
}

/**
 * Provider authentication result
 */
export interface IProviderAuthResult {
  success: boolean;
  user?: IAuthUser;
  account?: IProviderAccount;
  error?: string;
  isNewUser?: boolean;
}

/**
 * Google OAuth provider specific configuration
 */
export interface IGoogleProviderConfig extends IOAuthProviderConfig {
  id: "google";
  name: "Google";
  clientId: string;
  clientSecret: string;
}

/**
 * Resend email provider specific configuration
 */
export interface IResendProviderConfig extends IEmailProviderConfig {
  id: "resend";
  name: "Resend";
  apiKey: string;
  from: string;
}

/**
 * Provider configuration map
 */
export interface IProviderConfigMap {
  google: IGoogleProviderConfig;
  resend: IResendProviderConfig;
}

/**
 * Provider selection criteria
 */
export interface IProviderSelectionCriteria {
  type?: "oauth" | "email";
  supportedFeatures?: string[];
  userPreference?: string;
}

/**
 * Provider capabilities
 */
export interface IProviderCapabilities {
  supportsOAuth: boolean;
  supportsEmail: boolean;
  supportsPasswordReset: boolean;
  supportsAccountLinking: boolean;
  supportsProfileUpdates: boolean;
}
