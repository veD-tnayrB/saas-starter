import "server-only";

import { cache } from "react";
import { auth } from "@/auth";

export const getCurrentUser = cache(async () => {
  const session = await auth();
  if (!session?.user) {
    return undefined;
  }
  
  // Return session user directly to avoid database calls in Edge Runtime
  // The session already contains the necessary user information
  return session.user;
});