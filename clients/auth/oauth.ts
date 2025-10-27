import type { OAuthProviderConfig } from "@/types/auth";

/**
 * OAuth client interface
 */
export interface OAuthClient {
  getAuthorizationUrl(provider: string, state?: string): string;
  exchangeCodeForTokens(
    provider: string,
    code: string,
  ): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
  }>;
  getUserInfo(
    provider: string,
    accessToken: string,
  ): Promise<{
    id: string;
    name?: string;
    email?: string;
    image?: string;
  }>;
  refreshAccessToken(
    provider: string,
    refreshToken: string,
  ): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
  }>;
}

/**
 * OAuth provider configuration map
 */
export interface OAuthProviderMap {
  [key: string]: OAuthProviderConfig;
}

/**
 * OAuth token response
 */
export interface OAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
}

/**
 * OAuth user info response
 */
export interface OAuthUserInfoResponse {
  id: string;
  name?: string;
  email?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  locale?: string;
  verified_email?: boolean;
}

/**
 * Base OAuth client implementation
 */
export class BaseOAuthClient implements OAuthClient {
  protected providers: OAuthProviderMap;

  constructor(providers: OAuthProviderMap) {
    this.providers = providers;
  }

  getAuthorizationUrl(provider: string, state?: string): string {
    const providerConfig = this.providers[provider];
    if (!providerConfig) {
      throw new Error(`Provider ${provider} not configured`);
    }

    const params = new URLSearchParams({
      client_id: providerConfig.clientId,
      redirect_uri: this.getRedirectUri(provider),
      response_type: "code",
      scope: this.getScope(provider),
      ...(state && { state }),
    });

    return `${providerConfig.authorization?.url}?${params.toString()}`;
  }

  async exchangeCodeForTokens(
    provider: string,
    code: string,
  ): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
  }> {
    const providerConfig = this.providers[provider];
    if (!providerConfig) {
      throw new Error(`Provider ${provider} not configured`);
    }

    const response = await fetch(providerConfig.token?.url || "", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        client_id: providerConfig.clientId,
        client_secret: providerConfig.clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: this.getRedirectUri(provider),
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to exchange code for tokens: ${response.statusText}`,
      );
    }

    const tokenData: OAuthTokenResponse = await response.json();

    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000)
        : undefined,
    };
  }

  async getUserInfo(
    provider: string,
    accessToken: string,
  ): Promise<{
    id: string;
    name?: string;
    email?: string;
    image?: string;
  }> {
    const providerConfig = this.providers[provider];
    if (!providerConfig) {
      throw new Error(`Provider ${provider} not configured`);
    }

    const response = await fetch(providerConfig.userinfo?.url || "", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get user info: ${response.statusText}`);
    }

    const userData: OAuthUserInfoResponse = await response.json();

    // Use provider-specific profile mapping if available
    if (providerConfig.profile) {
      return providerConfig.profile(
        userData as unknown as Record<string, unknown>,
      );
    }

    // Default mapping
    return {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      image: userData.picture,
    };
  }

  async refreshAccessToken(
    provider: string,
    refreshToken: string,
  ): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
  }> {
    const providerConfig = this.providers[provider];
    if (!providerConfig) {
      throw new Error(`Provider ${provider} not configured`);
    }

    const response = await fetch(providerConfig.token?.url || "", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        client_id: providerConfig.clientId,
        client_secret: providerConfig.clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh access token: ${response.statusText}`);
    }

    const tokenData: OAuthTokenResponse = await response.json();

    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000)
        : undefined,
    };
  }

  /**
   * Get redirect URI for provider
   */
  protected getRedirectUri(provider: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    console.log("base url: ", baseUrl);
    return `${baseUrl}/api/auth/callback/${provider}`;
  }

  /**
   * Get scope for provider
   */
  protected getScope(provider: string): string {
    const scopes: Record<string, string> = {
      google: "openid email profile",
      github: "user:email",
      discord: "identify email",
    };

    return scopes[provider] || "openid email profile";
  }
}

/**
 * Google OAuth client implementation
 */
export class GoogleOAuthClient extends BaseOAuthClient {
  constructor(clientId: string, clientSecret: string) {
    super({
      google: {
        id: "google",
        name: "Google",
        type: "oauth",
        clientId,
        clientSecret,
        authorization: {
          url: "https://accounts.google.com/o/oauth2/v2/auth",
        },
        token: {
          url: "https://oauth2.googleapis.com/token",
        },
        userinfo: {
          url: "https://www.googleapis.com/oauth2/v2/userinfo",
        },
        profile: (profile: Record<string, unknown>) => ({
          id: profile.id as string,
          name: profile.name as string,
          email: profile.email as string,
          image: profile.picture as string,
        }),
      },
    });
  }
}

/**
 * OAuth client factory
 */
export class OAuthClientFactory {
  /**
   * Create OAuth client for provider
   */
  static createClient(
    provider: string,
    config: {
      clientId: string;
      clientSecret: string;
    },
  ): OAuthClient {
    switch (provider) {
      case "google":
        return new GoogleOAuthClient(config.clientId, config.clientSecret);
      default:
        throw new Error(`Unsupported OAuth provider: ${provider}`);
    }
  }

  /**
   * Create Google OAuth client
   */
  static createGoogleClient(): OAuthClient {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("Google OAuth credentials not configured");
    }

    return new GoogleOAuthClient(clientId, clientSecret);
  }
}

/**
 * OAuth utility functions
 */
export class OAuthUtils {
  /**
   * Generate secure state parameter
   */
  static generateState(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      "",
    );
  }

  /**
   * Validate state parameter
   */
  static validateState(receivedState: string, expectedState: string): boolean {
    return receivedState === expectedState;
  }

  /**
   * Extract provider from callback URL
   */
  static extractProviderFromCallback(url: string): string | null {
    const match = url.match(/\/api\/auth\/callback\/([^\/\?]+)/);
    return match ? match[1] : null;
  }

  /**
   * Extract code from callback URL
   */
  static extractCodeFromCallback(url: string): string | null {
    const urlObj = new URL(url);
    return urlObj.searchParams.get("code");
  }

  /**
   * Extract state from callback URL
   */
  static extractStateFromCallback(url: string): string | null {
    const urlObj = new URL(url);
    return urlObj.searchParams.get("state");
  }

  /**
   * Extract error from callback URL
   */
  static extractErrorFromCallback(url: string): string | null {
    const urlObj = new URL(url);
    return urlObj.searchParams.get("error");
  }
}
