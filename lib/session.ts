import "server-only";

import { cache } from "react";
import NextAuth from "@/auth";
import { getServerSession } from "next-auth";

export const getCurrentUser = cache(async () => {
  const session = await getServerSession(NextAuth);
  if (!session?.user) {
    return undefined;
  }

  // Return session user directly to avoid database calls in Edge Runtime
  // The session already contains the necessary user information
  return session.user;
});
