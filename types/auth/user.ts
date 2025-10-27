import { UserRole } from "@prisma/client";

/**
 * Core user data structure
 */
export interface AuthUser {
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
export interface UserCreateData {
  name?: string;
  email: string;
  emailVerified?: Date;
  image?: string;
  role?: UserRole;
}

/**
 * User data for updates
 */
export interface UserUpdateData {
  name?: string;
  email?: string;
  emailVerified?: Date;
  image?: string;
  role?: UserRole;
}

/**
 * User profile information
 */
export interface UserProfile {
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
export interface UserVerificationStatus {
  isEmailVerified: boolean;
  emailVerifiedAt?: Date | null;
  verificationToken?: string;
  verificationTokenExpires?: Date;
}

/**
 * User search criteria
 */
export interface UserSearchCriteria {
  id?: string;
  email?: string;
  role?: UserRole;
  isEmailVerified?: boolean;
}

/**
 * User registration data
 */
export interface UserRegistrationData {
  name?: string;
  email: string;
  image?: string;
  provider?: string;
  providerAccountId?: string;
}

/**
 * User authentication result
 */
export interface UserAuthResult {
  user: AuthUser;
  isNewUser: boolean;
  requiresVerification: boolean;
}

/**
 * User deletion result
 */
export interface UserDeletionResult {
  success: boolean;
  deletedUserId: string;
  error?: string;
}

/**
 * User statistics
 */
export interface UserStats {
  totalUsers: number;
  verifiedUsers: number;
  adminUsers: number;
  recentSignups: number;
}

/**
 * User activity data
 */
export interface UserActivity {
  userId: string;
  lastLoginAt?: Date;
  loginCount: number;
  lastActivityAt: Date;
}

/**
 * User preferences
 */
export interface UserPreferences {
  userId: string;
  theme?: "light" | "dark" | "system";
  language?: string;
  notifications?: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
}
