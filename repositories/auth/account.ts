import { randomUUID } from "crypto";
import { sql } from "kysely";

import type {
  IProviderAccount,
  IProviderLinkData,
  IProviderUnlinkData,
} from "@/types/auth";
import { db } from "@/lib/db";

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
    const result = await sql<IProviderAccount>`
      SELECT 
        id,
        user_id AS userId,
        type,
        provider,
        provider_account_id AS providerAccountId,
        refresh_token,
        access_token,
        expires_at,
        token_type,
        scope,
        id_token,
        session_state,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM accounts
      WHERE provider = ${provider}
        AND provider_account_id = ${providerAccountId}
      LIMIT 1
    `.execute(db);

    const row = result.rows[0];
    if (!row) return null;

    return row;
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
    const result = await sql<IProviderAccount>`
      SELECT 
        id,
        user_id AS userId,
        type,
        provider,
        provider_account_id AS providerAccountId,
        refresh_token,
        access_token,
        expires_at,
        token_type,
        scope,
        id_token,
        session_state,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM accounts
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `.execute(db);

    return result.rows;
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
    const result = await sql<IProviderAccount>`
      SELECT 
        id,
        user_id AS userId,
        type,
        provider,
        provider_account_id AS providerAccountId,
        refresh_token,
        access_token,
        expires_at,
        token_type,
        scope,
        id_token,
        session_state,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM accounts
      WHERE id = ${id}
      LIMIT 1
    `.execute(db);

    const row = result.rows[0];
    if (!row) return null;

    return row;
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
    const id = randomUUID();

    const result = await sql<IProviderAccount>`
      INSERT INTO accounts (
        id,
        user_id,
        type,
        provider,
        provider_account_id,
        refresh_token,
        access_token,
        expires_at,
        token_type,
        scope,
        id_token,
        session_state,
        created_at,
        updated_at
      )
      VALUES (
        ${id},
        ${data.userId},
        ${data.type},
        ${data.provider},
        ${data.providerAccountId},
        ${data.refresh_token ?? null},
        ${data.access_token ?? null},
        ${data.expires_at ?? null},
        ${data.token_type ?? null},
        ${data.scope ?? null},
        ${data.id_token ?? null},
        ${data.session_state ?? null},
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      RETURNING 
        id,
        user_id AS userId,
        type,
        provider,
        provider_account_id AS providerAccountId,
        refresh_token,
        access_token,
        expires_at,
        token_type,
        scope,
        id_token,
        session_state,
        created_at AS createdAt,
        updated_at AS updatedAt
    `.execute(db);

    const row = result.rows[0];
    if (!row) throw new Error("Failed to create account");

    return row;
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
    // Build SET clause parts using sql fragments for proper sanitization
    const setParts = [sql.raw("updated_at = CURRENT_TIMESTAMP")];

    if (data.refresh_token !== undefined) {
      setParts.push(sql`refresh_token = ${data.refresh_token ?? null}`);
    }
    if (data.access_token !== undefined) {
      setParts.push(sql`access_token = ${data.access_token ?? null}`);
    }
    if (data.expires_at !== undefined) {
      setParts.push(sql`expires_at = ${data.expires_at ?? null}`);
    }
    if (data.token_type !== undefined) {
      setParts.push(sql`token_type = ${data.token_type ?? null}`);
    }
    if (data.scope !== undefined) {
      setParts.push(sql`scope = ${data.scope ?? null}`);
    }
    if (data.id_token !== undefined) {
      setParts.push(sql`id_token = ${data.id_token ?? null}`);
    }
    if (data.session_state !== undefined) {
      setParts.push(sql`session_state = ${data.session_state ?? null}`);
    }

    // Combine all SET parts safely
    const setClause = sql.join(setParts, sql`, `);

    const result = await sql<IProviderAccount>`
      UPDATE accounts
      SET ${setClause}
      WHERE id = ${id}
      RETURNING 
        id,
        user_id AS userId,
        type,
        provider,
        provider_account_id AS providerAccountId,
        refresh_token,
        access_token,
        expires_at,
        token_type,
        scope,
        id_token,
        session_state,
        created_at AS createdAt,
        updated_at AS updatedAt
    `.execute(db);

    const row = result.rows[0];
    if (!row) throw new Error("Account not found");

    return row;
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
    await sql`
      DELETE FROM accounts
      WHERE id = ${id}
    `.execute(db);

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
    const result = await sql<{
      id: string;
    }>`
      SELECT id
      FROM accounts
      WHERE user_id = ${data.userId}
        AND provider = ${data.provider}
      LIMIT 1
    `.execute(db);

    const account = result.rows[0];
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
    const [totalAccountsResult, accountsByProviderResult, linkedUsersResult] =
      await Promise.all([
        sql<{ count: string }>`
          SELECT COUNT(*)::text as count
          FROM accounts
        `.execute(db),
        sql<{
          provider: string;
          count: string;
        }>`
          SELECT provider, COUNT(*)::text as count
          FROM accounts
          GROUP BY provider
        `.execute(db),
        sql<{ count: string }>`
          SELECT COUNT(DISTINCT user_id)::text as count
          FROM accounts
        `.execute(db),
      ]);

    const totalAccounts = parseInt(
      totalAccountsResult.rows[0]?.count || "0",
      10,
    );
    const linkedUsers = parseInt(linkedUsersResult.rows[0]?.count || "0", 10);

    const providerStats = accountsByProviderResult.rows.reduce(
      (acc, row) => {
        acc[row.provider] = parseInt(row.count, 10);
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
    const currentTimestamp = Math.floor(Date.now() / 1000);

    const result = await sql<{ count: string }>`
      UPDATE accounts
      SET 
        access_token = NULL,
        refresh_token = NULL,
        expires_at = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE expires_at < ${currentTimestamp}
      RETURNING id
    `.execute(db);

    return result.rows.length;
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
    const currentTimestamp = Math.floor(Date.now() / 1000);

    const result = await sql<IProviderAccount>`
      SELECT 
        id,
        user_id AS userId,
        type,
        provider,
        provider_account_id AS providerAccountId,
        refresh_token,
        access_token,
        expires_at,
        token_type,
        scope,
        id_token,
        session_state,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM accounts
      WHERE expires_at < ${currentTimestamp}
        AND access_token IS NOT NULL
    `.execute(db);

    return result.rows;
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
