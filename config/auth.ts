import { createDefaultEmailClient } from "@/clients/auth";
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";

import { env } from "@/env.mjs";

// Create email client instance
const emailClient = createDefaultEmailClient();

// Custom verification request handler using new email client
const sendVerificationRequest = async (params: {
  identifier: string;
  url: string;
  expires: Date;
  provider: { server?: string; from?: string };
  token: string;
  theme: { brandColor?: string; logo?: string };
  request: Request;
}) => {
  try {
    // Extract user info from params
    const user = {
      id: params.identifier,
      email: params.identifier,
      name: null,
      image: null,
      role: "USER" as const,
      emailVerified: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Generate verification URL
    const verificationUrl = params.url;

    // Send verification email using new client
    await emailClient.sendVerificationEmail(user, verificationUrl);
  } catch (error) {
    console.error("Error sending verification request:", error);
    throw new Error("Failed to send verification email");
  }
};

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    Resend({
      apiKey: env.RESEND_API_KEY,
      from: env.EMAIL_FROM,
      sendVerificationRequest,
    }),
  ],
};

export default authConfig;
