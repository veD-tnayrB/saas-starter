import { sessionManagementService } from "@/services/auth";
import { projectService } from "@/services/projects";
import NextAuth, { type DefaultSession } from "next-auth";

import authConfig from "@/config/auth";
import { KyselyAdapter } from "@/lib/adapters/kysely-adapter";
import { getSession, setNextAuthConfig } from "@/lib/session";

// More info: https://next-auth.js.org/getting-started/typescript#module-augmentation
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

const nextAuthConfig = {
  adapter: KyselyAdapter(),
  session: { strategy: "jwt" as const },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ token, session }) {
      return await sessionManagementService.handleSessionCallback(
        token,
        session,
      );
    },

    async jwt({ token, user, account, profile, trigger, isNewUser, session }) {
      const result = await sessionManagementService.handleJWTCallback(
        token,
        user,
        trigger,
        session,
      );
      return result || token;
    },
  },
  events: {
    async createUser({ user }) {
      // Auto-create personal project for new OAuth users
      try {
        await projectService.createPersonalProject(user.id, user.name || null);
      } catch (error) {
        console.error("Error creating personal project for new user:", error);
        // Don't throw - allow user creation to succeed
      }
    },
  },
  ...authConfig,
  debug: process.env.NODE_ENV !== "production",
};

const handler = NextAuth(nextAuthConfig);

// Set the config in lib/session to enable caching
setNextAuthConfig(nextAuthConfig);

export { handler as GET, handler as POST };
export default nextAuthConfig;

// Export auth function for use in server components and API routes (cached)
export const auth = async () => {
  return getSession();
};
