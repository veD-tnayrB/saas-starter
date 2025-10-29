import type {
  IProviderAccount,
  IProviderLinkData,
  IProviderUnlinkData,
} from "@/types/auth";
import { prisma } from "@/lib/db";

/**
 * Find account by provider and provider account ID
 * @param provider - Provider name
 * @param providerAccountId - Provider account ID
 * @returns Account data or null if not found
 */
export async function findAccountByProvider(
  provider: string,
  providerAccountId: string,
): Promise<IProviderAccount | null> {
  try {
    const account = await prisma.account.findFirst({
      where: {
        provider,
        providerAccountId,
      },
    });

    return account;
  } catch (error) {
    console.error("Error finding account by provider:", error);
    throw new Error("Failed to find account by provider");
  }
}

/**
 * Find accounts by user ID
 * @param userId - User ID
 * @returns Array of user accounts
 */
export async function findAccountsByUserId(
  userId: string,
): Promise<IProviderAccount[]> {
  try {
    const accounts = await prisma.account.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return accounts;
  } catch (error) {
    console.error("Error finding accounts by user ID:", error);
    throw new Error("Failed to find accounts by user ID");
  }
}

/**
 * Find account by ID
 * @param id - Account ID
 * @returns Account data or null if not found
 */
export async function findAccountById(
  id: string,
): Promise<IProviderAccount | null> {
  try {
    const account = await prisma.account.findUnique({
      where: { id },
    });

    return account;
  } catch (error) {
    console.error("Error finding account by ID:", error);
    throw new Error("Failed to find account by ID");
  }
}

/**
 * Create a new account
 * @param data - Account creation data
 * @returns Created account data
 */
export async function createAccount(data: {
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string | null;
  access_token?: string | null;
  expires_at?: number | null;
  token_type?: string | null;
  scope?: string | null;
  id_token?: string | null;
  session_state?: string | null;
}): Promise<IProviderAccount> {
  try {
    const account = await prisma.account.create({
      data: {
        userId: data.userId,
        type: data.type,
        provider: data.provider,
        providerAccountId: data.providerAccountId,
        refresh_token: data.refresh_token,
        access_token: data.access_token,
        expires_at: data.expires_at,
        token_type: data.token_type,
        scope: data.scope,
        id_token: data.id_token,
        session_state: data.session_state,
      },
    });

    return account;
  } catch (error) {
    console.error("Error creating account:", error);
    throw new Error("Failed to create account");
  }
}

/**
 * Update account data
 * @param id - Account ID
 * @param data - Account update data
 * @returns Updated account data
 */
export async function updateAccount(
  id: string,
  data: {
    refresh_token?: string | null;
    access_token?: string | null;
    expires_at?: number | null;
    token_type?: string | null;
    scope?: string | null;
    id_token?: string | null;
    session_state?: string | null;
  },
): Promise<IProviderAccount> {
  try {
    const account = await prisma.account.update({
      where: { id },
      data: {
        refresh_token: data.refresh_token,
        access_token: data.access_token,
        expires_at: data.expires_at,
        token_type: data.token_type,
        scope: data.scope,
        id_token: data.id_token,
        session_state: data.session_state,
      },
    });

    return account;
  } catch (error) {
    console.error("Error updating account:", error);
    throw new Error("Failed to update account");
  }
}

/**
 * Delete account
 * @param id - Account ID
 * @returns Success status
 */
export async function deleteAccount(id: string): Promise<boolean> {
  try {
    await prisma.account.delete({
      where: { id },
    });

    return true;
  } catch (error) {
    console.error("Error deleting account:", error);
    throw new Error("Failed to delete account");
  }
}

/**
 * Link provider account to user
 * @param data - Provider link data
 * @returns Created account data
 */
export async function linkProviderAccount(
  data: IProviderLinkData,
): Promise<IProviderAccount> {
  try {
    // Check if account already exists
    const existingAccount = await findAccountByProvider(
      data.provider,
      data.providerAccountId,
    );

    if (existingAccount) {
      throw new Error("Account already linked to another user");
    }

    const account = await createAccount({
      userId: data.userId,
      type: "oauth",
      provider: data.provider,
      providerAccountId: data.providerAccountId,
      access_token: data.accessToken,
      refresh_token: data.refreshToken,
      expires_at: data.expiresAt
        ? Math.floor(data.expiresAt.getTime() / 1000)
        : null,
    });

    return account;
  } catch (error) {
    console.error("Error linking provider account:", error);
    throw new Error("Failed to link provider account");
  }
}

/**
 * Unlink provider account from user
 * @param data - Provider unlink data
 * @returns Success status
 */
export async function unlinkProviderAccount(
  data: IProviderUnlinkData,
): Promise<boolean> {
  try {
    const account = await prisma.account.findFirst({
      where: {
        userId: data.userId,
        provider: data.provider,
      },
    });

    if (!account) {
      throw new Error("Account not found");
    }

    await deleteAccount(account.id);
    return true;
  } catch (error) {
    console.error("Error unlinking provider account:", error);
    throw new Error("Failed to unlink provider account");
  }
}

/**
 * Get account statistics
 * @returns Account statistics
 */
export async function getAccountStats(): Promise<{
  totalAccounts: number;
  accountsByProvider: Record<string, number>;
  linkedUsers: number;
}> {
  try {
    const [totalAccounts, accountsByProvider, linkedUsers] = await Promise.all([
      prisma.account.count(),
      prisma.account.groupBy({
        by: ["provider"],
        _count: {
          provider: true,
        },
      }),
      prisma.user.count({
        where: {
          accounts: {
            some: {},
          },
        },
      }),
    ]);

    const providerStats = accountsByProvider.reduce(
      (acc, item) => {
        acc[item.provider] = item._count.provider;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      totalAccounts,
      accountsByProvider: providerStats,
      linkedUsers,
    };
  } catch (error) {
    console.error("Error getting account stats:", error);
    throw new Error("Failed to get account stats");
  }
}

/**
 * Clean up expired tokens
 * @returns Number of updated accounts
 */
export async function cleanupExpiredTokens(): Promise<number> {
  try {
    const result = await prisma.account.updateMany({
      where: {
        expires_at: {
          lt: Math.floor(Date.now() / 1000),
        },
      },
      data: {
        access_token: null,
        refresh_token: null,
        expires_at: null,
      },
    });

    return result.count;
  } catch (error) {
    console.error("Error cleaning up expired tokens:", error);
    throw new Error("Failed to cleanup expired tokens");
  }
}

/**
 * Find accounts with expired tokens
 * @returns Array of accounts with expired tokens
 */
export async function findAccountsWithExpiredTokens(): Promise<
  IProviderAccount[]
> {
  try {
    const accounts = await prisma.account.findMany({
      where: {
        expires_at: {
          lt: Math.floor(Date.now() / 1000),
        },
        access_token: {
          not: null,
        },
      },
    });

    return accounts;
  } catch (error) {
    console.error("Error finding accounts with expired tokens:", error);
    throw new Error("Failed to find accounts with expired tokens");
  }
}

/**
 * Refresh account tokens
 * @param id - Account ID
 * @param newTokens - New token data
 * @returns Updated account data
 */
export async function refreshAccountTokens(
  id: string,
  newTokens: {
    access_token?: string;
    refresh_token?: string;
    expires_at?: number;
  },
): Promise<IProviderAccount> {
  try {
    const account = await updateAccount(id, {
      access_token: newTokens.access_token || null,
      refresh_token: newTokens.refresh_token || null,
      expires_at: newTokens.expires_at || null,
    });

    return account;
  } catch (error) {
    console.error("Error refreshing account tokens:", error);
    throw new Error("Failed to refresh account tokens");
  }
}
