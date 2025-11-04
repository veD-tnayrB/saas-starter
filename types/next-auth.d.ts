import { User } from "next-auth";

export type ExtendedUser = User;

declare module "next-auth/jwt" {
  interface JWT {
    // No role in JWT - roles are project-specific
  }
}

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}
