/**
 * Auth Repository Module
 *
 * This module provides data access functions for the authentication system.
 * It handles all database operations for users, sessions, and accounts.
 *
 * @module repositories/auth
 */

// User repository functions
export {
  createUser,
  deleteUser,
  findUserByEmail,
  findUserById,
  findUserByProvider,
  getUserActivity,
  getUserProfile,
  getUserStats,
  searchUsers,
  updateUser,
  updateUserVerification,
} from "./user";

// Session repository functions
export {
  cleanupExpiredSessions,
  createSession,
  deleteSession,
  deleteSessionByToken,
  deleteUserSessions,
  findSessionById,
  findSessionByToken,
  findSessionsByUserId,
  getSessionStats,
  updateSession,
  validateSession,
} from "./session";

// Account repository functions
export {
  cleanupExpiredTokens,
  createAccount,
  deleteAccount,
  findAccountById,
  findAccountByProvider,
  findAccountsByUserId,
  findAccountsWithExpiredTokens,
  getAccountStats,
  linkProviderAccount,
  refreshAccountTokens,
  unlinkProviderAccount,
  updateAccount,
} from "./account";

// Re-export types for convenience
export type {
  AuthUser,
  ProviderAccount,
  ProviderLinkData,
  ProviderUnlinkData,
  SessionCreateData,
  SessionUpdateData,
  SessionValidationResult,
  UserActivity,
  UserCreateData,
  UserProfile,
  UserSearchCriteria,
  UserStats,
  UserUpdateData,
  UserVerificationStatus,
} from "@/types/auth";
