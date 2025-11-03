import { createDefaultEmailClient } from "@/clients/auth";
import { projectService } from "@/services/projects";

import type {
  IAuthUser,
  IUserAuthResult,
  IUserRegistrationData,
} from "@/types/auth";

import { userAuthService } from "./user";

/**
 * User registration service
 */
export class RegistrationService {
  private emailClient = createDefaultEmailClient();

  /**
   * Initiate user registration
   */
  async initiateRegistration(
    data: IUserRegistrationData,
  ): Promise<IUserAuthResult> {
    try {
      // Validate registration data
      const validation = this.validateRegistrationData(data);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      // Check if user already exists
      const existingUser = await userAuthService.authenticateUser(data.email);
      if (existingUser) {
        throw new Error("User already exists");
      }

      // Create user
      const result = await userAuthService.registerUser({
        name: data.name,
        email: data.email,
        image: data.image,
        role: "USER",
      });

      // Auto-create personal project for new user
      if (result.user && result.isNewUser) {
        try {
          await projectService.createPersonalProject(
            result.user.id,
            result.user.name || null,
          );
        } catch (error) {
          console.error("Error creating personal project:", error);
          // Don't fail registration if project creation fails
        }
      }

      return result;
    } catch (error) {
      console.error("Error initiating registration:", error);
      throw new Error("Failed to initiate registration");
    }
  }

  /**
   * Complete user registration
   */
  async completeRegistration(
    userId: string,
    verificationToken?: string,
  ): Promise<IAuthUser> {
    try {
      // Get user
      const user = await userAuthService.userService.getUserById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // If verification token is provided, verify it
      if (verificationToken) {
        const isValid = await this.verifyRegistrationToken(verificationToken);
        if (!isValid) {
          throw new Error("Invalid verification token");
        }
      }

      // Update user as verified
      const updatedUser = await userAuthService.updateUserProfile(userId, {
        emailVerified: new Date(),
      });

      return updatedUser;
    } catch (error) {
      console.error("Error completing registration:", error);
      throw new Error("Failed to complete registration");
    }
  }

  /**
   * Validate registration data
   */
  validateRegistrationData(data: IUserRegistrationData): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Email validation
    if (!data.email) {
      errors.push("Email is required");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push("Invalid email format");
      }
    }

    // Name validation
    if (data.name && data.name.length < 2) {
      errors.push("Name must be at least 2 characters long");
    }

    // Provider validation
    if (data.provider && !["google", "email"].includes(data.provider)) {
      errors.push("Invalid provider");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Verify registration token
   */
  async verifyRegistrationToken(token: string): Promise<boolean> {
    try {
      // In a real implementation, you would verify the token against a database
      // For now, we'll do a simple validation
      return token.length > 10;
    } catch (error) {
      console.error("Error verifying registration token:", error);
      return false;
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(user: IAuthUser): Promise<void> {
    try {
      await this.emailClient.sendWelcomeEmail(user);
    } catch (error) {
      console.error("Error sending welcome email:", error);
      // Don't throw error for email failures
    }
  }

  /**
   * Handle OAuth registration
   */
  async handleOAuthRegistration(
    provider: string,
    providerData: {
      id: string;
      name?: string;
      email?: string;
      image?: string;
    },
  ): Promise<IUserAuthResult> {
    try {
      // Check if user already exists
      const existingUser = await userAuthService.authenticateUser(
        providerData.email || "",
      );

      if (existingUser) {
        return {
          user: existingUser.user,
          isNewUser: false,
          requiresVerification: !existingUser.user.emailVerified,
        };
      }

      // Create new user
      const result = await this.initiateRegistration({
        name: providerData.name,
        email: providerData.email || "",
        image: providerData.image,
        provider,
        providerAccountId: providerData.id,
      });

      // Send welcome email for new users
      if (result.isNewUser) {
        await this.sendWelcomeEmail(result.user);
      }

      return result;
    } catch (error) {
      console.error("Error handling OAuth registration:", error);
      throw new Error("Failed to handle OAuth registration");
    }
  }

  /**
   * Check registration eligibility
   */
  async checkRegistrationEligibility(email: string): Promise<{
    eligible: boolean;
    reason?: string;
  }> {
    try {
      // Check if email is available
      const emailAvailable =
        await userAuthService.userService.isEmailAvailable(email);
      if (!emailAvailable) {
        return {
          eligible: false,
          reason: "Email already registered",
        };
      }

      // Check domain restrictions (if any)
      const domain = email.split("@")[1];
      const restrictedDomains =
        process.env.RESTRICTED_EMAIL_DOMAINS?.split(",") || [];

      if (restrictedDomains.includes(domain)) {
        return {
          eligible: false,
          reason: "Domain not allowed",
        };
      }

      return { eligible: true };
    } catch (error) {
      console.error("Error checking registration eligibility:", error);
      return {
        eligible: false,
        reason: "Unable to verify eligibility",
      };
    }
  }

  /**
   * Get registration statistics
   */
  async getRegistrationStats(): Promise<{
    totalRegistrations: number;
    registrationsToday: number;
    registrationsThisWeek: number;
    registrationsThisMonth: number;
  }> {
    try {
      const stats = await userAuthService.userService.getUserStats();

      return {
        totalRegistrations: stats.totalUsers,
        registrationsToday: 0, // Would need to implement date filtering
        registrationsThisWeek: 0, // Would need to implement date filtering
        registrationsThisMonth: stats.recentSignups,
      };
    } catch (error) {
      console.error("Error getting registration stats:", error);
      throw new Error("Failed to get registration stats");
    }
  }
}

// Export singleton instance
export const registrationService = new RegistrationService();
