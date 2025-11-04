import { constructMetadata } from "@/lib/utils";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

export const metadata = constructMetadata({
  title: "Privacy Policy – SaaS Starter",
  description: "Privacy Policy for SaaS Starter",
});

export default function PrivacyPage() {
  return (
    <MaxWidthWrapper className="py-16">
      <div className="prose prose-slate mx-auto max-w-4xl dark:prose-invert">
        <h1>Privacy Policy</h1>
        <p className="text-muted-foreground">
          Last updated:{" "}
          {new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            SaaS Starter ("we," "our," or "us") is committed to protecting your
            privacy. This Privacy Policy explains how we collect, use, disclose,
            and safeguard your information when you use our Service.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          <h3>2.1 Information You Provide</h3>
          <p>
            We collect information that you provide directly to us, including:
          </p>
          <ul>
            <li>
              <strong>Account Information:</strong> Name, email address, and
              password when you create an account
            </li>
            <li>
              <strong>Profile Information:</strong> Optional profile information
              such as display name and avatar
            </li>
            <li>
              <strong>Payment Information:</strong> Billing address and payment
              method details (processed securely through Stripe)
            </li>
            <li>
              <strong>Content:</strong> Information you create or upload,
              including projects, files, and communications
            </li>
          </ul>

          <h3>2.2 Information Automatically Collected</h3>
          <p>
            When you use our Service, we automatically collect certain
            information about your device and usage, including:
          </p>
          <ul>
            <li>IP address and browser type</li>
            <li>Device information and operating system</li>
            <li>Usage data and analytics</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our Service</li>
            <li>Process transactions and manage subscriptions</li>
            <li>Send you technical notices and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Monitor and analyze usage patterns and trends</li>
            <li>Detect, prevent, and address technical issues</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2>4. Information Sharing and Disclosure</h2>
          <p>
            We do not sell, trade, or rent your personal information to third
            parties. We may share your information in the following
            circumstances:
          </p>
          <ul>
            <li>
              <strong>Service Providers:</strong> We share information with
              third-party service providers who perform services on our behalf,
              such as payment processing (Stripe), email delivery (Resend), and
              hosting (Vercel)
            </li>
            <li>
              <strong>Legal Requirements:</strong> We may disclose information
              if required by law or in response to valid requests by public
              authorities
            </li>
            <li>
              <strong>Business Transfers:</strong> Information may be
              transferred in connection with a merger, acquisition, or sale of
              assets
            </li>
            <li>
              <strong>With Your Consent:</strong> We may share information with
              your explicit consent
            </li>
          </ul>
        </section>

        <section>
          <h2>5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational security
            measures to protect your personal information against unauthorized
            access, alteration, disclosure, or destruction. However, no method
            of transmission over the Internet or electronic storage is 100%
            secure, and we cannot guarantee absolute security.
          </p>
          <p>Our security measures include:</p>
          <ul>
            <li>Encryption of data in transit and at rest</li>
            <li>Regular security assessments and updates</li>
            <li>Access controls and authentication</li>
            <li>Secure payment processing through Stripe</li>
          </ul>
        </section>

        <section>
          <h2>6. Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar tracking technologies to track activity
            on our Service and hold certain information. Cookies are files with
            a small amount of data that may include an anonymous unique
            identifier.
          </p>
          <p>We use cookies for:</p>
          <ul>
            <li>Authentication and session management</li>
            <li>Preference and settings storage</li>
            <li>Analytics and performance monitoring</li>
          </ul>
          <p>
            You can instruct your browser to refuse all cookies or to indicate
            when a cookie is being sent. However, if you do not accept cookies,
            you may not be able to use some portions of our Service.
          </p>
        </section>

        <section>
          <h2>7. Your Rights and Choices</h2>
          <p>
            You have the following rights regarding your personal information:
          </p>
          <ul>
            <li>
              <strong>Access:</strong> Request access to your personal
              information
            </li>
            <li>
              <strong>Correction:</strong> Request correction of inaccurate or
              incomplete information
            </li>
            <li>
              <strong>Deletion:</strong> Request deletion of your personal
              information
            </li>
            <li>
              <strong>Objection:</strong> Object to processing of your personal
              information
            </li>
            <li>
              <strong>Portability:</strong> Request transfer of your information
              to another service
            </li>
            <li>
              <strong>Withdrawal:</strong> Withdraw consent where processing is
              based on consent
            </li>
          </ul>
          <p>
            To exercise these rights, please contact us at{" "}
            <a href="mailto:support@saas-starter.com">
              support@saas-starter.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2>8. Data Retention</h2>
          <p>
            We retain your personal information for as long as necessary to
            fulfill the purposes outlined in this Privacy Policy, unless a
            longer retention period is required or permitted by law. When you
            delete your account, we will delete or anonymize your personal
            information, except where we are required to retain it for legal
            purposes.
          </p>
        </section>

        <section>
          <h2>9. Children's Privacy</h2>
          <p>
            Our Service is not intended for children under the age of 13. We do
            not knowingly collect personal information from children under 13.
            If you are a parent or guardian and believe your child has provided
            us with personal information, please contact us immediately.
          </p>
        </section>

        <section>
          <h2>10. International Data Transfers</h2>
          <p>
            Your information may be transferred to and maintained on computers
            located outside of your state, province, country, or other
            governmental jurisdiction where data protection laws may differ from
            those of your jurisdiction. By using our Service, you consent to the
            transfer of your information to these facilities.
          </p>
        </section>

        <section>
          <h2>11. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page
            and updating the "Last updated" date.
          </p>
          <p>
            You are advised to review this Privacy Policy periodically for any
            changes. Changes to this Privacy Policy are effective when they are
            posted on this page.
          </p>
        </section>

        <section>
          <h2>12. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us at{" "}
            <a href="mailto:support@saas-starter.com">
              support@saas-starter.com
            </a>
            .
          </p>
        </section>
      </div>
    </MaxWidthWrapper>
  );
}
