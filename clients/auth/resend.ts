import { Resend } from "resend";

import type { AuthUser } from "@/types/auth";

import {
  BaseEmailClient,
  EmailTemplateGenerator,
  type EmailConfig,
  type EmailResult,
} from "./email";

/**
 * Resend email client implementation
 */
export class ResendEmailClient extends BaseEmailClient {
  private resend: Resend;

  constructor(config: EmailConfig & { apiKey: string }) {
    super(config);
    this.resend = new Resend(config.apiKey);
  }

  /**
   * Send verification email using Resend
   */
  async sendVerificationEmail(user: AuthUser, token: string): Promise<void> {
    try {
      if (!this.validateEmail(user.email || "")) {
        throw new Error("Invalid email address");
      }

      const verificationUrl = this.generateVerificationUrl(token);
      const template = EmailTemplateGenerator.generateVerificationTemplate(
        user,
        verificationUrl,
      );

      const result = await this.resend.emails.send({
        from: this.config.from,
        to: [user.email!],
        subject: template.subject,
        html: this.sanitizeContent(template.html),
        text: template.text,
      });

      if (result.error) {
        throw new Error(`Resend error: ${result.error.message}`);
      }
    } catch (error) {
      console.error("Error sending verification email:", error);
      throw new Error("Failed to send verification email");
    }
  }

  /**
   * Send password reset email using Resend
   */
  async sendPasswordResetEmail(user: AuthUser, token: string): Promise<void> {
    try {
      if (!this.validateEmail(user.email || "")) {
        throw new Error("Invalid email address");
      }

      const resetUrl = this.generatePasswordResetUrl(token);
      const template = EmailTemplateGenerator.generatePasswordResetTemplate(
        user,
        resetUrl,
      );

      const result = await this.resend.emails.send({
        from: this.config.from,
        to: [user.email!],
        subject: template.subject,
        html: this.sanitizeContent(template.html),
        text: template.text,
      });

      if (result.error) {
        throw new Error(`Resend error: ${result.error.message}`);
      }
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw new Error("Failed to send password reset email");
    }
  }

  /**
   * Send welcome email using Resend
   */
  async sendWelcomeEmail(user: AuthUser): Promise<void> {
    try {
      if (!this.validateEmail(user.email || "")) {
        throw new Error("Invalid email address");
      }

      const template = EmailTemplateGenerator.generateWelcomeTemplate(user);

      const result = await this.resend.emails.send({
        from: this.config.from,
        to: [user.email!],
        subject: template.subject,
        html: this.sanitizeContent(template.html),
        text: template.text,
      });

      if (result.error) {
        throw new Error(`Resend error: ${result.error.message}`);
      }
    } catch (error) {
      console.error("Error sending welcome email:", error);
      throw new Error("Failed to send welcome email");
    }
  }

  /**
   * Send account deletion email using Resend
   */
  async sendAccountDeletionEmail(user: AuthUser): Promise<void> {
    try {
      if (!this.validateEmail(user.email || "")) {
        throw new Error("Invalid email address");
      }

      const template =
        EmailTemplateGenerator.generateAccountDeletionTemplate(user);

      const result = await this.resend.emails.send({
        from: this.config.from,
        to: [user.email!],
        subject: template.subject,
        html: this.sanitizeContent(template.html),
        text: template.text,
      });

      if (result.error) {
        throw new Error(`Resend error: ${result.error.message}`);
      }
    } catch (error) {
      console.error("Error sending account deletion email:", error);
      throw new Error("Failed to send account deletion email");
    }
  }

  /**
   * Send custom email using Resend
   */
  async sendCustomEmail(
    to: string | string[],
    subject: string,
    html: string,
    text?: string,
  ): Promise<EmailResult> {
    try {
      const recipients = Array.isArray(to) ? to : [to];

      // Validate all email addresses
      for (const email of recipients) {
        if (!this.validateEmail(email)) {
          throw new Error(`Invalid email address: ${email}`);
        }
      }

      const result = await this.resend.emails.send({
        from: this.config.from,
        to: recipients,
        subject,
        html: this.sanitizeContent(html),
        text: text || this.sanitizeContent(html),
      });

      if (result.error) {
        return {
          success: false,
          error: result.error.message,
        };
      }

      return {
        success: true,
        messageId: result.data?.id,
      };
    } catch (error) {
      console.error("Error sending custom email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get email delivery status
   */
  async getEmailStatus(messageId: string): Promise<{
    status: string;
    deliveredAt?: Date;
    error?: string;
  }> {
    try {
      // Note: Resend doesn't provide a direct API to check email status
      // This is a placeholder for future implementation
      return {
        status: "sent",
      };
    } catch (error) {
      console.error("Error getting email status:", error);
      return {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Test email configuration
   */
  async testConfiguration(): Promise<boolean> {
    try {
      const testResult = await this.resend.emails.send({
        from: this.config.from,
        to: ["test@example.com"],
        subject: "Test Email",
        html: "<p>This is a test email to verify configuration.</p>",
        text: "This is a test email to verify configuration.",
      });

      return !testResult.error;
    } catch (error) {
      console.error("Error testing email configuration:", error);
      return false;
    }
  }
}

/**
 * Create Resend email client instance
 */
export function createResendClient(config: {
  apiKey: string;
  from: string;
  replyTo?: string;
}): ResendEmailClient {
  return new ResendEmailClient({
    from: config.from,
    replyTo: config.replyTo,
    apiKey: config.apiKey,
  });
}

/**
 * Default Resend client configuration
 */
export function getDefaultResendConfig(): {
  apiKey: string;
  from: string;
  replyTo?: string;
} {
  return {
    apiKey: process.env.RESEND_API_KEY || "",
    from: process.env.RESEND_FROM_EMAIL || "noreply@example.com",
    replyTo: process.env.RESEND_REPLY_TO_EMAIL,
  };
}
