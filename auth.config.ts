import type { NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";

import { env } from "@/env.mjs";

export default {
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    // Email provider (Resend) is not available in NextAuth v4
    // Use custom email authentication flow if needed
  ],
} satisfies NextAuthOptions;
