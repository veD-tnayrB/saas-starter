import { UserRole } from "@prisma/client";

/**
 * Core user data structure
 */
export interface IAuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User data for creation
 */
export interface IUserCreateData {
  name?: string;
  email: string;
  emailVerified?: Date;
  image?: string;
  role?: UserRole;
}

/**
 * User data for updates
 */
export interface IUserUpdateData {
  name?: string;
  email?: string;
  emailVerified?: Date;
  image?: string;
  role?: UserRole;
}

/**
 * User profile information
 */
export interface IUserProfile {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: UserRole;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User verification status
 */
export interface IUserVerificationStatus {
  isEmailVerified: boolean;
  emailVerifiedAt?: Date | null;
  verificationToken?: string;
  verificationTokenExpires?: Date;
}

/**
 * User search criteria
 */
export interface IUserSearchCriteria {
  id?: string;
  email?: string;
  role?: UserRole;
  isEmailVerified?: boolean;
}

/**
 * User registration data
 */
export interface IUserRegistrationData {
  name?: string;
  email: string;
  image?: string;
  provider?: string;
  providerAccountId?: string;
}

/**
 * User authentication result
 */
export interface IUserAuthResult {
  user: IAuthUser;
  isNewUser: boolean;
  requiresVerification: boolean;
}

/**
 * User deletion result
 */
export interface IUserDeletionResult {
  success: boolean;
  deletedUserId: string;
  error?: string;
}

/**
 * User statistics
 */
export interface IUserStats {
  totalUsers: number;
  verifiedUsers: number;
  adminUsers: number;
  recentSignups: number;
}

/**
 * User activity data
 */
export interface IUserActivity {
  userId: string;
  lastLoginAt?: Date;
  loginCount: number;
  lastActivityAt: Date;
}

/**
 * User preferences
 */
export interface IUserPreferences {
  userId: string;
  theme?: "light" | "dark" | "system";
  language?: string;
  notifications?: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
}
