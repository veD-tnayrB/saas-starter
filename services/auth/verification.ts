import { createDefaultEmailClient } from "@/clients/auth";

import type { IAuthUser } from "@/types/auth";

import { userAuthService } from "./user";

/**
 * Email verification service
 */
export class VerificationService {
  private emailClient = createDefaultEmailClient();

  /**
   * Send verification email
   */
  async sendVerificationEmail(user: IAuthUser): Promise<void> {
    try {
      // Generate verification token
      const token = this.generateVerificationToken();

      // Store token (in a real implementation, you would store this in a database)
      await this.storeVerificationToken(user.id, token);

      // Send email
      await this.emailClient.sendVerificationEmail(user, token);
    } catch (error) {
      console.error("Error sending verification email:", error);
      throw new Error("Failed to send verification email");
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
      // Get user ID from token
      const userId = await this.getUserIdFromToken(token);
      if (!userId) {
        return {
          success: false,
          error: "Invalid or expired token",
        };
      }

      // Get user
      const user = await userAuthService.userService.getUserById(userId);
      if (!user) {
        return {
          success: false,
          error: "User not found",
        };
      }

      // Update user as verified
      const updatedUser = await userAuthService.updateUserProfile(userId, {
        emailVerified: new Date(),
      });

      // Remove token
      await this.removeVerificationToken(token);

      return {
        success: true,
        user: updatedUser,
      };
    } catch (error) {
      console.error("Error verifying email token:", error);
      return {
        success: false,
        error: "Failed to verify email",
      };
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(userId: string): Promise<void> {
    try {
      // Get user
      const user = await userAuthService.userService.getUserById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Check if already verified
      if (user.emailVerified) {
        throw new Error("Email already verified");
      }

      // Send verification email
      await this.sendVerificationEmail(user);
    } catch (error) {
      console.error("Error resending verification email:", error);
      throw new Error("Failed to resend verification email");
    }
  }

  /**
   * Check verification status
   */
  async checkVerificationStatus(userId: string): Promise<{
    isVerified: boolean;
    verifiedAt?: Date;
  }> {
    try {
      const user = await userAuthService.getUserById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      return {
        isVerified: !!user.emailVerified,
        verifiedAt: user.emailVerified || undefined,
      };
    } catch (error) {
      console.error("Error checking verification status:", error);
      throw new Error("Failed to check verification status");
    }
  }

  /**
   * Generate verification token
   */
  private generateVerificationToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      "",
    );
  }

  /**
   * Store verification token
   */
  private async storeVerificationToken(
    userId: string,
    token: string,
  ): Promise<void> {
    try {
      // In a real implementation, you would store this in a database
      // For now, we'll use a simple in-memory store (not recommended for production)
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Store in a database table like verification_tokens
      // await verificationTokenRepository.create({
      //   data: {
      //     userId,
      //     token,
      //     expiresAt,
      //   },
      // });

      console.log(`Stored verification token for user ${userId}: ${token}`);
    } catch (error) {
      console.error("Error storing verification token:", error);
      throw new Error("Failed to store verification token");
    }
  }

  /**
   * Get user ID from token
   */
  private async getUserIdFromToken(token: string): Promise<string | null> {
    try {
      // In a real implementation, you would query the database
      // For now, we'll return null (not recommended for production)

      // const verificationToken = await verificationTokenRepository.findByToken({
      //   where: { token },
      //   include: { user: true },
      // });

      // if (!verificationToken || verificationToken.expiresAt < new Date()) {
      //   return null;
      // }

      // return verificationToken.userId;

      return null; // Placeholder
    } catch (error) {
      console.error("Error getting user ID from token:", error);
      return null;
    }
  }

  /**
   * Remove verification token
   */
  private async removeVerificationToken(token: string): Promise<void> {
    try {
      // In a real implementation, you would delete from database
      // await verificationTokenRepository.deleteByToken({
      //   where: { token },
      // });

      console.log(`Removed verification token: ${token}`);
    } catch (error) {
      console.error("Error removing verification token:", error);
      // Don't throw error for cleanup failures
    }
  }

  /**
   * Clean up expired tokens
   */
  async cleanupExpiredTokens(): Promise<number> {
    try {
      // In a real implementation, you would delete expired tokens from database
      // const result = await verificationTokenRepository.deleteExpired({
      //   where: {
      //     expiresAt: {
      //       lt: new Date(),
      //     },
      //   },
      // });

      // return result.count;

      return 0; // Placeholder
    } catch (error) {
      console.error("Error cleaning up expired tokens:", error);
      return 0;
    }
  }

  /**
   * Generate verification URL
   */
  generateVerificationUrl(token: string): string {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    return `${baseUrl}/api/auth/verify-email?token=${token}`;
  }

  /**
   * Validate verification token format
   */
  validateTokenFormat(token: string): boolean {
    // Check if token is a valid hex string of correct length
    const hexRegex = /^[0-9a-f]{64}$/;
    return hexRegex.test(token);
  }
}

/**
 * Password reset service
 */
export class PasswordResetService {
  private emailClient = createDefaultEmailClient();

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      // Get user by email
      const user = await userAuthService.userService.getUserByEmail(email);
      if (!user) {
        // Don't reveal if user exists or not
        return;
      }

      // Generate reset token
      const token = this.generateResetToken();

      // Store token
      await this.storeResetToken(user.id, token);

      // Send email
      await this.emailClient.sendPasswordResetEmail(user, token);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      // Don't throw error to prevent email enumeration
    }
  }

  /**
   * Verify password reset token
   */
  async verifyResetToken(token: string): Promise<{
    valid: boolean;
    userId?: string;
    error?: string;
  }> {
    try {
      // Get user ID from token
      const userId = await this.getUserIdFromResetToken(token);
      if (!userId) {
        return {
          valid: false,
          error: "Invalid or expired token",
        };
      }

      return {
        valid: true,
        userId,
      };
    } catch (error) {
      console.error("Error verifying reset token:", error);
      return {
        valid: false,
        error: "Failed to verify token",
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
      // Verify token
      const verification = await this.verifyResetToken(token);
      if (!verification.valid || !verification.userId) {
        return {
          success: false,
          error: "Invalid or expired token",
        };
      }

      // Update password (in a real implementation, you would hash the password)
      // await userAuthService.updateUserProfile(verification.userId, {
      //   password: await hashPassword(newPassword),
      // });

      // Remove token
      await this.removeResetToken(token);

      return { success: true };
    } catch (error) {
      console.error("Error resetting password:", error);
      return {
        success: false,
        error: "Failed to reset password",
      };
    }
  }

  /**
   * Generate reset token
   */
  private generateResetToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      "",
    );
  }

  /**
   * Store reset token
   */
  private async storeResetToken(userId: string, token: string): Promise<void> {
    try {
      // In a real implementation, you would store this in a database
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      console.log(`Stored reset token for user ${userId}: ${token}`);
    } catch (error) {
      console.error("Error storing reset token:", error);
      throw new Error("Failed to store reset token");
    }
  }

  /**
   * Get user ID from reset token
   */
  private async getUserIdFromResetToken(token: string): Promise<string | null> {
    try {
      // In a real implementation, you would query the database
      return null; // Placeholder
    } catch (error) {
      console.error("Error getting user ID from reset token:", error);
      return null;
    }
  }

  /**
   * Remove reset token
   */
  private async removeResetToken(token: string): Promise<void> {
    try {
      // In a real implementation, you would delete from database
      console.log(`Removed reset token: ${token}`);
    } catch (error) {
      console.error("Error removing reset token:", error);
    }
  }
}

// Export singleton instances
export const verificationService = new VerificationService();
export const passwordResetService = new PasswordResetService();
