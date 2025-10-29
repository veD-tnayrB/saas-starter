import type { NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";

import { env } from "@/env.mjs";

export const authConfig: NextAuthOptions = {
  secret: process.env.AUTH_SECRET,
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],
};

export default authConfig;
