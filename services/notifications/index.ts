/**
 * Notifications Service Module
 *
 * This module provides business logic for notification operations.
 * It orchestrates email clients and notification management.
 *
 * @module services/notifications
 */

import { emailClient } from "@/clients/auth/email";

import type { IAuthUser } from "@/types/auth";

/**
 * Notification result
 */
export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Email notification data
 */
export interface EmailNotificationData {
  user: IAuthUser;
  subject?: string;
  template?: string;
  data?: Record<string, unknown>;
}

/**
 * Welcome email data
 */
export interface WelcomeEmailData {
  user: IAuthUser;
  onboardingUrl?: string;
}

/**
 * Password reset email data
 */
export interface PasswordResetEmailData {
  user: IAuthUser;
  resetToken: string;
  resetUrl?: string;
}

/**
 * Account verification email data
 */
export interface VerificationEmailData {
  user: IAuthUser;
  verificationToken: string;
  verificationUrl?: string;
}

/**
 * Account deletion email data
 */
export interface AccountDeletionEmailData {
  user: IAuthUser;
  reason?: string;
}

/**
 * Main notifications service that handles all notification operations
 */
export class NotificationService {
  /**
   * Send welcome email to new user
   * @param data - Welcome email data
   * @returns Notification result
   */
  async sendWelcomeEmail(data: WelcomeEmailData): Promise<NotificationResult> {
    try {
      const { user } = data;

      if (!user.email) {
        throw new Error("User email is required");
      }

      await emailClient.sendWelcomeEmail(user);

      return {
        success: true,
        messageId: `welcome-${user.id}-${Date.now()}`,
      };
    } catch (error) {
      console.error("Error sending welcome email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send password reset email
   * @param data - Password reset email data
   * @returns Notification result
   */
  async sendPasswordResetEmail(
    data: PasswordResetEmailData,
  ): Promise<NotificationResult> {
    try {
      const { user, resetToken } = data;

      if (!user.email) {
        throw new Error("User email is required");
      }

      await emailClient.sendPasswordResetEmail(user, resetToken);

      return {
        success: true,
        messageId: `password-reset-${user.id}-${Date.now()}`,
      };
    } catch (error) {
      console.error("Error sending password reset email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send email verification email
   * @param data - Verification email data
   * @returns Notification result
   */
  async sendVerificationEmail(
    data: VerificationEmailData,
  ): Promise<NotificationResult> {
    try {
      const { user, verificationToken } = data;

      if (!user.email) {
        throw new Error("User email is required");
      }

      await emailClient.sendVerificationEmail(user, verificationToken);

      return {
        success: true,
        messageId: `verification-${user.id}-${Date.now()}`,
      };
    } catch (error) {
      console.error("Error sending verification email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send account deletion email
   * @param data - Account deletion email data
   * @returns Notification result
   */
  async sendAccountDeletionEmail(
    data: AccountDeletionEmailData,
  ): Promise<NotificationResult> {
    try {
      const { user } = data;

      if (!user.email) {
        throw new Error("User email is required");
      }

      await emailClient.sendAccountDeletionEmail(user);

      return {
        success: true,
        messageId: `account-deletion-${user.id}-${Date.now()}`,
      };
    } catch (error) {
      console.error("Error sending account deletion email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send custom email notification
   * @param data - Email notification data
   * @returns Notification result
   */
  async sendCustomEmail(
    data: EmailNotificationData,
  ): Promise<NotificationResult> {
    try {
      const { user, subject, template, data: templateData } = data;

      if (!user.email) {
        throw new Error("User email is required");
      }

      // For now, we'll use the welcome email template as a fallback
      // In a more complex system, you'd have template management
      if (template === "welcome") {
        return await this.sendWelcomeEmail({ user });
      }

      if (template === "password-reset") {
        const resetToken = templateData?.resetToken as string;
        if (!resetToken) {
          throw new Error("Reset token is required for password reset email");
        }
        return await this.sendPasswordResetEmail({ user, resetToken });
      }

      if (template === "verification") {
        const verificationToken = templateData?.verificationToken as string;
        if (!verificationToken) {
          throw new Error(
            "Verification token is required for verification email",
          );
        }
        return await this.sendVerificationEmail({ user, verificationToken });
      }

      if (template === "account-deletion") {
        return await this.sendAccountDeletionEmail({ user });
      }

      throw new Error(`Unknown email template: ${template}`);
    } catch (error) {
      console.error("Error sending custom email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Validate user for notifications
   * @param user - User to validate
   * @returns True if user is valid for notifications
   */
  private validateUser(user: IAuthUser): boolean {
    return !!(user.email && user.id);
  }

  /**
   * Get notification preferences for user
   * @param user - User to get preferences for
   * @returns Notification preferences
   */
  async getUserNotificationPreferences(user: IAuthUser): Promise<{
    emailNotifications: boolean;
    welcomeEmails: boolean;
    passwordResetEmails: boolean;
    verificationEmails: boolean;
    accountDeletionEmails: boolean;
  }> {
    // For now, return default preferences
    // In a more complex system, this would come from user settings
    return {
      emailNotifications: true,
      welcomeEmails: true,
      passwordResetEmails: true,
      verificationEmails: true,
      accountDeletionEmails: true,
    };
  }

  /**
   * Update user notification preferences
   * @param user - User to update preferences for
   * @param preferences - New notification preferences
   * @returns Success status
   */
  async updateUserNotificationPreferences(
    user: IAuthUser,
    preferences: {
      emailNotifications?: boolean;
      welcomeEmails?: boolean;
      passwordResetEmails?: boolean;
      verificationEmails?: boolean;
      accountDeletionEmails?: boolean;
    },
  ): Promise<boolean> {
    try {
      // For now, just return success
      // In a more complex system, this would update user settings in database
      console.log(
        `Updated notification preferences for user ${user.id}:`,
        preferences,
      );
      return true;
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      return false;
    }
  }
}

/**
 * Default notification service instance
 * Direct instantiation for SaaS starter kit simplicity
 */
export const notificationService = new NotificationService();
