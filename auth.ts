import { sessionManagementService } from "@/services/auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { UserRole } from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth";

import authConfig from "@/config/auth";
import { prisma } from "@/lib/db";

// More info: https://next-auth.js.org/getting-started/typescript#module-augmentation
declare module "next-auth" {
  interface Session {
    user: {
      role: UserRole;
    } & DefaultSession["user"];
  }
}

const nextAuthConfig = {
  adapter: PrismaAdapter(prisma),
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
      );
      return result || token;
    },
  },
  ...authConfig,
  debug: process.env.NODE_ENV !== "production",
};

const handler = NextAuth(nextAuthConfig);

export { handler as GET, handler as POST };
export default nextAuthConfig;
