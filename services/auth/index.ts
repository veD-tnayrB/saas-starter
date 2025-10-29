/**
 * Auth Service Module
 *
 * This module provides business logic for the authentication system.
 * It orchestrates repositories and clients to implement authentication workflows.
 *
 * @module services/auth
 */

import type {
  IAuthUser,
  IUserRegistrationData,
  IUserUpdateData,
} from "@/types/auth";

// Import service classes for direct instantiation
import { ProviderManagementService } from "./providers";
// Import service classes for type annotations
import type { ProviderManagementService as ProviderManagementServiceType } from "./providers";
import type { RegistrationService as RegistrationServiceType } from "./registration";
import { RegistrationService } from "./registration";
import type { SessionManagementService as SessionManagementServiceType } from "./session";
import { SessionManagementService } from "./session";
import type { UserAuthService as UserAuthServiceType } from "./user";
import { UserAuthService } from "./user";
import type { VerificationService as VerificationServiceType } from "./verification";
import { VerificationService } from "./verification";

// Session service exports
export {
  JWTService,
  jwtService,
  SessionManagementService,
  sessionManagementService,
  SessionService,
  sessionService,
} from "./session";

// User service exports
export {
  UserAuthService,
  userAuthService,
  UserService,
  userService,
} from "./user";

// Registration service exports
export { RegistrationService, registrationService } from "./registration";

// Verification service exports
export {
  PasswordResetService,
  passwordResetService,
  VerificationService,
  verificationService,
} from "./verification";

// Provider service exports
export {
  ProviderConfigService,
  providerConfigService,
  ProviderManagementService,
  providerManagementService,
  ProviderService,
  providerService,
} from "./providers";

// Re-export types for convenience
export type {
  IAuthSession,
  IAuthUser,
  IProviderAccount,
  IProviderAuthResult,
  IProviderLinkData,
  IProviderUnlinkData,
  ISessionValidationResult,
  IUserAuthResult,
  IUserCreateData,
  IUserDeletionResult,
  IUserRegistrationData,
  IUserUpdateData,
} from "@/types/auth";

/**
 * Main authentication service that orchestrates all auth operations
 */
export class AuthService {
  private sessionManagement: SessionManagementServiceType;
  private userAuth: UserAuthServiceType;
  private registration: RegistrationServiceType;
  private verification: VerificationServiceType;
  private providers: ProviderManagementServiceType;

  constructor() {
    // Direct instantiation using ES6 imports for SaaS starter kit simplicity
    this.sessionManagement = new SessionManagementService();
    this.userAuth = new UserAuthService();
    this.registration = new RegistrationService();
    this.verification = new VerificationService();
    this.providers = new ProviderManagementService();
  }

  /**
   * Sign in user with email
   */
  async signInWithEmail(email: string): Promise<{
    success: boolean;
    user?: IAuthUser;
    requiresVerification?: boolean;
    error?: string;
  }> {
    try {
      const result = await this.userAuth.authenticateUser(email);

      if (!result) {
        return {
          success: false,
          error: "Invalid credentials",
        };
      }

      return {
        success: true,
        user: result.user,
        requiresVerification: result.requiresVerification,
      };
    } catch (error) {
      console.error("Error signing in with email:", error);
      return {
        success: false,
        error: "Sign in failed",
      };
    }
  }

  /**
   * Sign up user with email
   */
  async signUpWithEmail(data: IUserRegistrationData): Promise<{
    success: boolean;
    user?: IAuthUser;
    requiresVerification?: boolean;
    error?: string;
  }> {
    try {
      const result = await this.registration.initiateRegistration(data);

      return {
        success: true,
        user: result.user,
        requiresVerification: result.requiresVerification,
      };
    } catch (error) {
      console.error("Error signing up with email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Sign up failed",
      };
    }
  }

  /**
   * Sign in with OAuth provider
   */
  async signInWithProvider(
    provider: string,
    code: string,
    state?: string,
  ): Promise<{
    success: boolean;
    user?: IAuthUser;
    isNewUser?: boolean;
    error?: string;
  }> {
    try {
      // TODO: Implement handleOAuthCallback method
      const result = await (
        this.providers as {
          handleOAuthCallback?: (
            provider: string,
            code: string,
            state?: string,
          ) => Promise<{
            success: boolean;
            user?: IAuthUser;
            isNewUser?: boolean;
            error?: string;
          }>;
        }
      ).handleOAuthCallback?.(provider, code, state);

      if (!result?.success) {
        return {
          success: false,
          error: result?.error || "OAuth callback failed",
        };
      }

      return {
        success: true,
        user: result.user,
        isNewUser: result.isNewUser,
      };
    } catch (error) {
      console.error("Error signing in with provider:", error);
      return {
        success: false,
        error: "Provider sign in failed",
      };
    }
  }

  /**
   * Sign out user
   */
  async signOut(sessionToken?: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      if (sessionToken) {
        await (
          this.sessionManagement as {
            destroyUserSession?: (token: string) => Promise<void>;
          }
        ).destroyUserSession?.(sessionToken);
      }

      return { success: true };
    } catch (error) {
      console.error("Error signing out:", error);
      return {
        success: false,
        error: "Sign out failed",
      };
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(sessionToken?: string): Promise<any | null> {
    try {
      return await this.sessionManagement.getCurrentUser(sessionToken);
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(sessionToken?: string): Promise<boolean> {
    try {
      return await this.sessionManagement.isAuthenticated(sessionToken);
    } catch (error) {
      console.error("Error checking authentication:", error);
      return false;
    }
  }

  /**
   * Check if user has role
   */
  async hasRole(sessionToken: string, role: string): Promise<boolean> {
    try {
      return await this.sessionManagement.hasRole(sessionToken, role);
    } catch (error) {
      console.error("Error checking user role:", error);
      return false;
    }
  }

  /**
   * Check if user is admin
   */
  async isAdmin(sessionToken: string): Promise<boolean> {
    try {
      return await this.sessionManagement.isAdmin(sessionToken);
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(user: IAuthUser): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      await this.verification.sendVerificationEmail(user);
      return { success: true };
    } catch (error) {
      console.error("Error sending verification email:", error);
      return {
        success: false,
        error: "Failed to send verification email",
      };
    }
  }

  /**
   * Verify email token
   */
  async verifyEmailToken(token: string): Promise<{
    success: boolean;
    user?: IAuthUser;
    error?: string;
  }> {
    try {
      return await this.verification.verifyEmailToken(token);
    } catch (error) {
      console.error("Error verifying email token:", error);
      return {
        success: false,
        error: "Failed to verify email",
      };
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      await (
        this.verification as {
          sendPasswordResetEmail?: (email: string) => Promise<void>;
        }
      ).sendPasswordResetEmail?.(email);
      return { success: true };
    } catch (error) {
      console.error("Error sending password reset email:", error);
      return {
        success: false,
        error: "Failed to send password reset email",
      };
    }
  }

  /**
   * Reset password
   */
  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const result = await (
        this.verification as {
          resetPassword?: (
            token: string,
            newPassword: string,
          ) => Promise<{ success: boolean; error?: string }>;
        }
      ).resetPassword?.(token, newPassword);

      return result || { success: false, error: "Password reset failed" };
    } catch (error) {
      console.error("Error resetting password:", error);
      return {
        success: false,
        error: "Failed to reset password",
      };
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    data: IUserUpdateData,
  ): Promise<{
    success: boolean;
    user?: IAuthUser;
    error?: string;
  }> {
    try {
      const user = await this.userAuth.updateUserProfile(userId, data);
      return {
        success: true,
        user,
      };
    } catch (error) {
      console.error("Error updating user profile:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update profile",
      };
    }
  }

  /**
   * Delete user account
   */
  async deleteUserAccount(userId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const result = await this.userAuth.deleteUserAccount(userId);
      return {
        success: result.success,
        error: result.error,
      };
    } catch (error) {
      console.error("Error deleting user account:", error);
      return {
        success: false,
        error: "Failed to delete account",
      };
    }
  }
}

// Export main auth service instance
export const authService = new AuthService();
