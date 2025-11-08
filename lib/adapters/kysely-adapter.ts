import {
  createAccount,
  createSession,
  createUser,
  deleteAccount,
  deleteSessionByToken,
  findAccountByProvider,
  findSessionByToken,
  findUserByEmail,
  findUserById,
  updateSession,
  updateUser,
} from "@/repositories/auth";
import type { Adapter, AdapterSession, AdapterUser } from "next-auth/adapters";

/**
 * Kysely Adapter for NextAuth
 *
 * Implements the NextAuth Adapter interface using Kysely raw SQL queries.
 * This replaces the legacy PrismaAdapter with our custom database layer.
 */
export function KyselyAdapter(): Adapter {
  const adapter: Adapter = {
    async createUser(user) {
      // NextAuth requires email for user creation
      if (!user.email) {
        throw new Error("Email is required for user creation");
      }

      const created = await createUser({
        name: user.name ?? undefined,
        email: user.email,
        emailVerified: user.emailVerified ?? undefined,
        image: user.image ?? undefined,
      });

      return {
        id: created.id,
        name: created.name,
        email: created.email,
        emailVerified: created.emailVerified,
        image: created.image,
      } as AdapterUser;
    },

    async getUser(id) {
      const user = await findUserById(id);
      if (!user) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
      } as AdapterUser;
    },

    async getUserByEmail(email) {
      if (!email) return null;

      const user = await findUserByEmail(email);
      if (!user) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
      } as AdapterUser;
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const account = await findAccountByProvider(provider, providerAccountId);
      if (!account) return null;

      const user = await findUserById(account.userId);
      if (!user) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
      } as AdapterUser;
    },

    async updateUser(user) {
      const updated = await updateUser(user.id, {
        name: user.name ?? undefined,
        email: user.email ?? undefined,
        emailVerified: user.emailVerified ?? undefined,
        image: user.image ?? undefined,
      });

      return {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        emailVerified: updated.emailVerified,
        image: updated.image,
      } as AdapterUser;
    },

    async linkAccount(account) {
      await createAccount({
        userId: account.userId,
        type: account.type,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        refresh_token: account.refresh_token ?? null,
        access_token: account.access_token ?? null,
        expires_at: account.expires_at ?? null,
        token_type: account.token_type ?? null,
        scope: account.scope ?? null,
        id_token: account.id_token ?? null,
        session_state: account.session_state ?? null,
      });

      return account;
    },

    async unlinkAccount({ providerAccountId, provider }) {
      const account = await findAccountByProvider(provider, providerAccountId);
      if (!account) return;

      await deleteAccount(account.id);
    },

    async createSession({ sessionToken, userId, expires }) {
      const session = await createSession({
        userId,
        sessionToken,
        expiresAt: expires,
      });

      return {
        sessionToken: session.sessionToken,
        userId: session.userId,
        expires: session.expires,
      } as AdapterSession;
    },

    async getSessionAndUser(sessionToken) {
      const session = await findSessionByToken(sessionToken);
      if (!session) return null;

      const user = await findUserById(session.userId);
      if (!user) return null;

      return {
        session: {
          sessionToken: session.sessionToken,
          userId: session.userId,
          expires: session.expires,
        } as AdapterSession,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image,
        } as AdapterUser,
      };
    },

    async updateSession({ sessionToken, expires }) {
      const session = await findSessionByToken(sessionToken);
      if (!session) return null;

      const updated = await updateSession(session.id, {
        expiresAt: expires,
      });

      return {
        sessionToken: updated.sessionToken,
        userId: updated.userId,
        expires: updated.expires,
      } as AdapterSession;
    },

    async deleteSession(sessionToken) {
      await deleteSessionByToken(sessionToken);
    },

    async createVerificationToken({ identifier, expires, token }) {
      // Note: Verification tokens are not currently stored in the database
      // This is a placeholder implementation
      // If you need verification tokens, you'll need to create a repository for them
      return {
        identifier,
        token,
        expires,
      };
    },

    async useVerificationToken({ identifier, token }) {
      // Note: Verification tokens are not currently stored in the database
      // This is a placeholder implementation
      // If you need verification tokens, you'll need to create a repository for them
      return null;
    },
  };

  return adapter;
}
