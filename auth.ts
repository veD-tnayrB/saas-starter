import { sessionManagementService } from "@/services/auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { UserRole } from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth";

import authConfig from "@/config/auth";
import { prisma } from "@/lib/db";

// More info: https://authjs.dev/getting-started/typescript#module-augmentation
declare module "next-auth" {
  interface Session {
    user: {
      role: UserRole;
    } & DefaultSession["user"];
  }
}

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    // error: "/auth/error",
  },
  callbacks: {
    async session({ token, session }) {
      return await sessionManagementService.handleSessionCallback(
        token,
        session,
      );
    },

    async jwt({ token, user }) {
      return await sessionManagementService.handleJWTCallback(token, user);
    },
  },
  ...authConfig,
  // debug: process.env.NODE_ENV !== "production"
});
