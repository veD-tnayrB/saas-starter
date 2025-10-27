import { createDefaultOAuthClient } from "@/clients/auth";
import {
  createAccount,
  findAccountByProvider,
  findAccountsByUserId,
  linkProviderAccount,
  unlinkProviderAccount,
} from "@/repositories/auth";

import type {
  ProviderAccount,
  ProviderAuthResult,
  ProviderLinkData,
  ProviderUnlinkData,
} from "@/types/auth";

import { registrationService } from "./registration";

/**
 * OAuth provider service
 */
export class ProviderService {
  private oauthClient = createDefaultOAuthClient();

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(
    provider: string,
    code: string,
    state?: string,
  ): Promise<ProviderAuthResult> {
    try {
      // Exchange code for tokens
      const tokens = await this.oauthClient.exchangeCodeForTokens(
        provider,
        code,
      );

      // Get user info from provider
      const userInfo = await this.oauthClient.getUserInfo(
        provider,
        tokens.accessToken,
      );

      // Check if account already exists
      const existingAccount = await findAccountByProvider(
        provider,
        userInfo.id,
      );

      if (existingAccount) {
        // User already exists, return existing user
        const user = await registrationService.handleOAuthRegistration(
          provider,
          userInfo,
        );
        return {
          success: true,
          user: user.user,
          account: existingAccount,
          isNewUser: user.isNewUser,
        };
      }

      // Check if user exists by email
      const existingUser = await registrationService.handleOAuthRegistration(
        provider,
        userInfo,
      );

      if (existingUser.isNewUser) {
        // Create new account
        const account = await createAccount({
          userId: existingUser.user.id,
          type: "oauth",
          provider,
          providerAccountId: userInfo.id,
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
          expires_at: tokens.expiresAt
            ? Math.floor(tokens.expiresAt.getTime() / 1000)
            : null,
        });

        return {
          success: true,
          user: existingUser.user,
          account,
          isNewUser: true,
        };
      } else {
        // Link account to existing user
        const account = await linkProviderAccount({
          userId: existingUser.user.id,
          provider,
          providerAccountId: userInfo.id,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt,
        });

        return {
          success: true,
          user: existingUser.user,
          account,
          isNewUser: false,
        };
      }
    } catch (error) {
      console.error("Error handling OAuth callback:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Link provider account to user
   */
  async linkProvider(data: ProviderLinkData): Promise<ProviderAuthResult> {
    try {
      // Check if account already exists
      const existingAccount = await findAccountByProvider(
        data.provider,
        data.providerAccountId,
      );
      if (existingAccount) {
        return {
          success: false,
          error: "Account already linked to another user",
        };
      }

      // Link account
      const account = await linkProviderAccount(data);

      return {
        success: true,
        account,
      };
    } catch (error) {
      console.error("Error linking provider:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Unlink provider account from user
   */
  async unlinkProvider(data: ProviderUnlinkData): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      await unlinkProviderAccount(data);
      return { success: true };
    } catch (error) {
      console.error("Error unlinking provider:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get user's linked providers
   */
  async getUserProviders(userId: string): Promise<ProviderAccount[]> {
    try {
      return await findAccountsByUserId(userId);
    } catch (error) {
      console.error("Error getting user providers:", error);
      throw new Error("Failed to get user providers");
    }
  }

  /**
   * Check if user has provider linked
   */
  async hasProviderLinked(userId: string, provider: string): Promise<boolean> {
    try {
      const accounts = await this.getUserProviders(userId);
      return accounts.some((account) => account.provider === provider);
    } catch (error) {
      console.error("Error checking provider link:", error);
      return false;
    }
  }

  /**
   * Get authorization URL for provider
   */
  getAuthorizationUrl(provider: string, state?: string): string {
    try {
      return this.oauthClient.getAuthorizationUrl(provider, state);
    } catch (error) {
      console.error("Error getting authorization URL:", error);
      throw new Error("Failed to get authorization URL");
    }
  }

  /**
   * Refresh provider tokens
   */
  async refreshProviderTokens(
    provider: string,
    refreshToken: string,
  ): Promise<{
    success: boolean;
    tokens?: {
      accessToken: string;
      refreshToken?: string;
      expiresAt?: Date;
    };
    error?: string;
  }> {
    try {
      const tokens = await this.oauthClient.refreshAccessToken(
        provider,
        refreshToken,
      );
      return {
        success: true,
        tokens,
      };
    } catch (error) {
      console.error("Error refreshing provider tokens:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get provider user info
   */
  async getProviderUserInfo(
    provider: string,
    accessToken: string,
  ): Promise<{
    success: boolean;
    userInfo?: {
      id: string;
      name?: string;
      email?: string;
      image?: string;
    };
    error?: string;
  }> {
    try {
      const userInfo = await this.oauthClient.getUserInfo(
        provider,
        accessToken,
      );
      return {
        success: true,
        userInfo,
      };
    } catch (error) {
      console.error("Error getting provider user info:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

/**
 * Provider configuration service
 */
export class ProviderConfigService {
  /**
   * Get available providers
   */
  getAvailableProviders(): string[] {
    return ["google", "email"];
  }

  /**
   * Get provider configuration
   */
  getProviderConfig(provider: string): {
    enabled: boolean;
    clientId?: string;
    name: string;
    type: "oauth" | "email";
  } {
    const configs: Record<string, any> = {
      google: {
        enabled: !!process.env.GOOGLE_CLIENT_ID,
        clientId: process.env.GOOGLE_CLIENT_ID,
        name: "Google",
        type: "oauth",
      },
      email: {
        enabled: !!process.env.RESEND_API_KEY,
        name: "Email",
        type: "email",
      },
    };

    return (
      configs[provider] || {
        enabled: false,
        name: provider,
        type: "oauth",
      }
    );
  }

  /**
   * Check if provider is enabled
   */
  isProviderEnabled(provider: string): boolean {
    const config = this.getProviderConfig(provider);
    return config.enabled;
  }

  /**
   * Get OAuth providers
   */
  getOAuthProviders(): string[] {
    return this.getAvailableProviders().filter((provider) => {
      const config = this.getProviderConfig(provider);
      return config.type === "oauth" && config.enabled;
    });
  }

  /**
   * Get email providers
   */
  getEmailProviders(): string[] {
    return this.getAvailableProviders().filter((provider) => {
      const config = this.getProviderConfig(provider);
      return config.type === "email" && config.enabled;
    });
  }
}

/**
 * Provider management service
 */
export class ProviderManagementService {
  private providerService: ProviderService;
  private configService: ProviderConfigService;

  constructor() {
    this.providerService = new ProviderService();
    this.configService = new ProviderConfigService();
  }

  /**
   * Get user's authentication methods
   */
  async getUserAuthMethods(userId: string): Promise<{
    providers: ProviderAccount[];
    hasPassword: boolean;
    hasEmail: boolean;
  }> {
    try {
      const providers = await this.providerService.getUserProviders(userId);
      const hasEmail = providers.some((p) => p.provider === "email");
      const hasPassword = false; // Would need to implement password authentication

      return {
        providers,
        hasPassword,
        hasEmail,
      };
    } catch (error) {
      console.error("Error getting user auth methods:", error);
      throw new Error("Failed to get user authentication methods");
    }
  }

  /**
   * Remove authentication method
   */
  async removeAuthMethod(
    userId: string,
    provider: string,
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Check if user has other auth methods
      const authMethods = await this.getUserAuthMethods(userId);

      if (authMethods.providers.length <= 1) {
        return {
          success: false,
          error: "Cannot remove the last authentication method",
        };
      }

      return await this.providerService.unlinkProvider({
        userId,
        provider,
      });
    } catch (error) {
      console.error("Error removing auth method:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get provider statistics
   */
  async getProviderStats(): Promise<{
    totalAccounts: number;
    accountsByProvider: Record<string, number>;
    linkedUsers: number;
  }> {
    try {
      // This would typically come from a repository method
      return {
        totalAccounts: 0,
        accountsByProvider: {},
        linkedUsers: 0,
      };
    } catch (error) {
      console.error("Error getting provider stats:", error);
      throw new Error("Failed to get provider statistics");
    }
  }
}

// Export singleton instances
export const providerService = new ProviderService();
export const providerConfigService = new ProviderConfigService();
export const providerManagementService = new ProviderManagementService();
