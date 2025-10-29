import { MagicLinkEmail } from "@/emails/magic-link-email";
import { getUserBasicInfoByEmail } from "@/repositories/auth/user";
import { EmailConfig as NextAuthEmailConfig } from "next-auth/providers/email";
import { Resend } from "resend";

import { env } from "@/env.mjs";
import type { IAuthUser } from "@/types/auth";
import { siteConfig } from "@/config/site";

/**
 * Email client interface for authentication-related emails
 */
export interface EmailClient {
  sendVerificationEmail(user: IAuthUser, token: string): Promise<void>;
  sendPasswordResetEmail(user: IAuthUser, token: string): Promise<void>;
  sendWelcomeEmail(user: IAuthUser): Promise<void>;
  sendAccountDeletionEmail(user: IAuthUser): Promise<void>;
}

/**
 * Email template types
 */
export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Email sending result
 */
export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Email configuration
 */
export interface EmailConfig {
  from: string;
  replyTo?: string;
  rateLimit?: {
    maxEmails: number;
    windowMs: number;
  };
}

/**
 * Base email client implementation
 */
export class BaseEmailClient implements EmailClient {
  protected config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  async sendVerificationEmail(user: IAuthUser, token: string): Promise<void> {
    throw new Error("sendVerificationEmail not implemented");
  }

  async sendPasswordResetEmail(user: IAuthUser, token: string): Promise<void> {
    throw new Error("sendPasswordResetEmail not implemented");
  }

  async sendWelcomeEmail(user: IAuthUser): Promise<void> {
    throw new Error("sendWelcomeEmail not implemented");
  }

  async sendAccountDeletionEmail(user: IAuthUser): Promise<void> {
    throw new Error("sendAccountDeletionEmail not implemented");
  }

  /**
   * Generate email verification URL
   */
  protected generateVerificationUrl(token: string): string {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    return `${baseUrl}/api/auth/verify-request?token=${token}`;
  }

  /**
   * Generate password reset URL
   */
  protected generatePasswordResetUrl(token: string): string {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    return `${baseUrl}/reset-password?token=${token}`;
  }

  /**
   * Validate email address
   */
  protected validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Sanitize email content
   */
  protected sanitizeContent(content: string): string {
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "");
  }
}

/**
 * Email template generator
 */
export class EmailTemplateGenerator {
  /**
   * Generate verification email template
   */
  static generateVerificationTemplate(
    user: IAuthUser,
    verificationUrl: string,
  ): EmailTemplate {
    const subject = "Verify your email address";
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb;">Verify Your Email Address</h1>
            <p>Hello ${user.name || "there"},</p>
            <p>Thank you for signing up! Please click the button below to verify your email address:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #666;">
              If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
        </body>
      </html>
    `;
    const text = `
      Verify Your Email Address
      
      Hello ${user.name || "there"},
      
      Thank you for signing up! Please visit the following link to verify your email address:
      
      ${verificationUrl}
      
      This link will expire in 24 hours.
      
      If you didn't create an account, you can safely ignore this email.
    `;

    return { subject, html, text };
  }

  /**
   * Generate password reset email template
   */
  static generatePasswordResetTemplate(
    user: IAuthUser,
    resetUrl: string,
  ): EmailTemplate {
    const subject = "Reset your password";
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #dc2626;">Reset Your Password</h1>
            <p>Hello ${user.name || "there"},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #666;">
              If you didn't request a password reset, you can safely ignore this email.
            </p>
          </div>
        </body>
      </html>
    `;
    const text = `
      Reset Your Password
      
      Hello ${user.name || "there"},
      
      We received a request to reset your password. Please visit the following link to create a new password:
      
      ${resetUrl}
      
      This link will expire in 1 hour.
      
      If you didn't request a password reset, you can safely ignore this email.
    `;

    return { subject, html, text };
  }

  /**
   * Generate welcome email template
   */
  static generateWelcomeTemplate(user: IAuthUser): EmailTemplate {
    const subject = "Welcome to our platform!";
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #059669;">Welcome!</h1>
            <p>Hello ${user.name || "there"},</p>
            <p>Welcome to our platform! We're excited to have you on board.</p>
            <p>Here are some things you can do to get started:</p>
            <ul>
              <li>Complete your profile</li>
              <li>Explore our features</li>
              <li>Connect with other users</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard" 
                 style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Get Started
              </a>
            </div>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #666;">
              Thank you for joining us!
            </p>
          </div>
        </body>
      </html>
    `;
    const text = `
      Welcome!
      
      Hello ${user.name || "there"},
      
      Welcome to our platform! We're excited to have you on board.
      
      Here are some things you can do to get started:
      - Complete your profile
      - Explore our features
      - Connect with other users
      
      Visit ${process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard to get started.
      
      If you have any questions, feel free to reach out to our support team.
      
      Thank you for joining us!
    `;

    return { subject, html, text };
  }

  /**
   * Generate account deletion email template
   */
  static generateAccountDeletionTemplate(user: IAuthUser): EmailTemplate {
    const subject = "Your account has been deleted";
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #dc2626;">Account Deleted</h1>
            <p>Hello ${user.name || "there"},</p>
            <p>Your account has been successfully deleted from our platform.</p>
            <p>All your data has been permanently removed from our systems.</p>
            <p>If you have any questions or if this was done in error, please contact our support team immediately.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #666;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </body>
      </html>
    `;
    const text = `
      Account Deleted
      
      Hello ${user.name || "there"},
      
      Your account has been successfully deleted from our platform.
      
      All your data has been permanently removed from our systems.
      
      If you have any questions or if this was done in error, please contact our support team immediately.
      
      This is an automated message. Please do not reply to this email.
    `;

    return { subject, html, text };
  }
}

/**
 * Resend email client implementation
 */
export class ResendEmailClient extends BaseEmailClient {
  private resend: Resend;

  constructor(config: EmailConfig) {
    super(config);
    this.resend = new Resend(env.RESEND_API_KEY);
  }

  /**
   * Send verification email using Resend
   */
  async sendVerificationEmail(user: IAuthUser, token: string): Promise<void> {
    const verificationUrl = this.generateVerificationUrl(token);
    const template = EmailTemplateGenerator.generateVerificationTemplate(
      user,
      verificationUrl,
    );

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.config.from,
        to: user.email!,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      if (error || !data) {
        throw new Error(error?.message || "Failed to send verification email");
      }
    } catch (error) {
      console.error("Error sending verification email:", error);
      throw new Error("Failed to send verification email");
    }
  }

  /**
   * Send password reset email using Resend
   */
  async sendPasswordResetEmail(user: IAuthUser, token: string): Promise<void> {
    const resetUrl = this.generatePasswordResetUrl(token);
    const template = EmailTemplateGenerator.generatePasswordResetTemplate(
      user,
      resetUrl,
    );

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.config.from,
        to: user.email!,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      if (error || !data) {
        throw new Error(
          error?.message || "Failed to send password reset email",
        );
      }
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw new Error("Failed to send password reset email");
    }
  }

  /**
   * Send welcome email using Resend
   */
  async sendWelcomeEmail(user: IAuthUser): Promise<void> {
    const template = EmailTemplateGenerator.generateWelcomeTemplate(user);

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.config.from,
        to: user.email!,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      if (error || !data) {
        throw new Error(error?.message || "Failed to send welcome email");
      }
    } catch (error) {
      console.error("Error sending welcome email:", error);
      throw new Error("Failed to send welcome email");
    }
  }

  /**
   * Send account deletion email using Resend
   */
  async sendAccountDeletionEmail(user: IAuthUser): Promise<void> {
    const template =
      EmailTemplateGenerator.generateAccountDeletionTemplate(user);

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.config.from,
        to: user.email!,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      if (error || !data) {
        throw new Error(
          error?.message || "Failed to send account deletion email",
        );
      }
    } catch (error) {
      console.error("Error sending account deletion email:", error);
      throw new Error("Failed to send account deletion email");
    }
  }
}

/**
 * NextAuth email verification request handler (legacy function)
 */
export const sendVerificationRequest: NextAuthEmailConfig["sendVerificationRequest"] =
  async ({ identifier, url, provider }) => {
    const user = await getUserBasicInfoByEmail(identifier);
    if (!user || !user.name) return;

    const userVerified = user?.emailVerified ? true : false;
    const authSubject = userVerified
      ? `Sign-in link for ${siteConfig.name}`
      : "Activate your account";

    const resend = new Resend(env.RESEND_API_KEY);

    try {
      const { data, error } = await resend.emails.send({
        from: provider.from || "onboarding@resend.dev",
        to:
          process.env.NODE_ENV === "development"
            ? "delivered@resend.dev"
            : identifier,
        subject: authSubject,
        react: MagicLinkEmail({
          firstName: user?.name as string,
          actionUrl: url,
          mailType: userVerified ? "login" : "register",
          siteName: siteConfig.name,
        }),
        // Set this to prevent Gmail from threading emails.
        // More info: https://resend.com/changelog/custom-email-headers
        headers: {
          "X-Entity-Ref-ID": new Date().getTime() + "",
        },
      });

      if (error || !data) {
        throw new Error(error?.message);
      }
    } catch (error) {
      throw new Error("Failed to send verification email.");
    }
  };

/**
 * Default Resend client instance
 * Direct instantiation for SaaS starter kit simplicity
 */
export const resend = new Resend(env.RESEND_API_KEY);

/**
 * Default email client instance
 * Direct instantiation for SaaS starter kit simplicity
 */
export const emailClient = new ResendEmailClient({
  from: "onboarding@resend.dev",
});
