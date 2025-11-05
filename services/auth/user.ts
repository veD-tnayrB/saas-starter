import {
  createUser,
  deleteUser,
  findUserByEmail,
  findUserById,
  getUserActivity,
  getUserProfile,
  getUserStats,
  searchUsers,
  updateUser,
} from "@/repositories/auth/user";

import type {
  IAuthUser,
  IUserActivity,
  IUserAuthResult,
  IUserCreateData,
  IUserDeletionResult,
  IUserProfile,
  IUserSearchCriteria,
  IUserStats,
  IUserUpdateData,
} from "@/types/auth";

/**
 * User service for managing user operations
 */
export class UserService {
  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<IAuthUser | null> {
    try {
      return await findUserById(id);
    } catch (error) {
      console.error("Error getting user by ID:", error);
      throw new Error("Failed to get user");
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<IAuthUser | null> {
    try {
      return await findUserByEmail(email);
    } catch (error) {
      console.error("Error getting user by email:", error);
      throw new Error("Failed to get user");
    }
  }

  /**
   * Create a new user
   */
  async createUser(data: IUserCreateData): Promise<IAuthUser> {
    try {
      // Validate email is unique
      const existingUser = await findUserByEmail(data.email);
      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      return await createUser(data);
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Failed to create user");
    }
  }

  /**
   * Update user data
   */
  async updateUser(id: string, data: IUserUpdateData): Promise<IAuthUser> {
    try {
      // Verify user exists
      const existingUser = await findUserById(id);
      if (!existingUser) {
        throw new Error("User not found");
      }

      // If email is being updated, check for conflicts
      if (data.email && data.email !== existingUser.email) {
        const emailUser = await findUserByEmail(data.email);
        if (emailUser) {
          throw new Error("Email already in use");
        }
      }

      return await updateUser(id, data);
    } catch (error) {
      console.error("Error updating user:", error);
      throw new Error("Failed to update user");
    }
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<IUserDeletionResult> {
    try {
      // Verify user exists
      const existingUser = await findUserById(id);
      if (!existingUser) {
        return {
          success: false,
          deletedUserId: id,
          error: "User not found",
        };
      }

      const success = await deleteUser(id);
      return {
        success,
        deletedUserId: id,
      };
    } catch (error) {
      console.error("Error deleting user:", error);
      return {
        success: false,
        deletedUserId: id,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(id: string): Promise<IUserProfile | null> {
    try {
      return await getUserProfile(id);
    } catch (error) {
      console.error("Error getting user profile:", error);
      throw new Error("Failed to get user profile");
    }
  }

  /**
   * Search users
   */
  async searchUsers(criteria: IUserSearchCriteria): Promise<IAuthUser[]> {
    try {
      return await searchUsers(criteria);
    } catch (error) {
      console.error("Error searching users:", error);
      throw new Error("Failed to search users");
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<IUserStats> {
    try {
      return await getUserStats();
    } catch (error) {
      console.error("Error getting user stats:", error);
      throw new Error("Failed to get user stats");
    }
  }

  /**
   * Get user activity
   */
  async getUserActivity(id: string): Promise<IUserActivity | null> {
    try {
      return await getUserActivity(id);
    } catch (error) {
      console.error("Error getting user activity:", error);
      throw new Error("Failed to get user activity");
    }
  }

  /**
   * Validate user data
   */
  validateUserData(data: IUserCreateData | IUserUpdateData): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Email validation
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push("Invalid email format");
      }
    }

    // Name validation
    if (data.name && data.name.length < 2) {
      errors.push("Name must be at least 2 characters long");
    }

    // No role validation needed - roles are project-specific

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if user exists
   */
  async userExists(id: string): Promise<boolean> {
    try {
      const user = await findUserById(id);
      return !!user;
    } catch (error) {
      console.error("Error checking if user exists:", error);
      return false;
    }
  }

  /**
   * Check if email is available
   */
  async isEmailAvailable(email: string): Promise<boolean> {
    try {
      const user = await findUserByEmail(email);
      return !user;
    } catch (error) {
      console.error("Error checking email availability:", error);
      return false;
    }
  }
}

/**
 * User authentication service
 */
export class UserAuthService {
  public userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Authenticate user by email
   */
  async authenticateUser(email: string): Promise<IUserAuthResult | null> {
    try {
      const user = await this.userService.getUserByEmail(email);

      if (!user) {
        return null;
      }

      return {
        user,
        isNewUser: false,
        requiresVerification: !user.emailVerified,
      };
    } catch (error) {
      console.error("Error authenticating user:", error);
      return null;
    }
  }

  /**
   * Register new user
   */
  async registerUser(data: IUserCreateData): Promise<IUserAuthResult> {
    try {
      // Validate user data
      const validation = this.userService.validateUserData(data);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      // Check if email is available
      const emailAvailable = await this.userService.isEmailAvailable(
        data.email,
      );
      if (!emailAvailable) {
        throw new Error("Email already in use");
      }

      // Create user
      const user = await this.userService.createUser(data);

      return {
        user,
        isNewUser: true,
        requiresVerification: true,
      };
    } catch (error) {
      console.error("Error registering user:", error);
      throw new Error("Failed to register user");
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    data: IUserUpdateData,
  ): Promise<IAuthUser> {
    try {
      return await this.userService.updateUser(userId, data);
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw new Error("Failed to update user profile");
    }
  }

  /**
   * Delete user account
   */
  async deleteUserAccount(userId: string): Promise<IUserDeletionResult> {
    try {
      return await this.userService.deleteUser(userId);
    } catch (error) {
      console.error("Error deleting user account:", error);
      throw new Error("Failed to delete user account");
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<IAuthUser | null> {
    return this.userService.getUserById(id);
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<IAuthUser | null> {
    return this.userService.getUserByEmail(email);
  }

  /**
   * Delete user (public method for other services)
   */
  async deleteUser(id: string): Promise<IUserDeletionResult> {
    return this.userService.deleteUser(id);
  }
}

// Export singleton instances
export const userService = new UserService();
export const userAuthService = new UserAuthService();
