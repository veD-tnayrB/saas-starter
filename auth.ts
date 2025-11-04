import { sessionManagementService } from "@/services/auth";
import { projectService } from "@/services/projects";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { type DefaultSession } from "next-auth";

import authConfig from "@/config/auth";
import { prisma } from "@/lib/db";

// More info: https://next-auth.js.org/getting-started/typescript#module-augmentation
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
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

export { handler as GET, handler as POST };
export default nextAuthConfig;

// Export auth function for use in server components and API routes
export const auth = async () => {
  const { getServerSession } = await import("next-auth");
  return getServerSession(nextAuthConfig);
};
