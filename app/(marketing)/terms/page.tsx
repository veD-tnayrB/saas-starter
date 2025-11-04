import { constructMetadata } from "@/lib/utils";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

export const metadata = constructMetadata({
  title: "Terms and Conditions – SaaS Starter",
  description: "Terms and Conditions for SaaS Starter",
});

export default function TermsPage() {
  return (
    <MaxWidthWrapper className="py-16">
      <div className="prose prose-slate mx-auto max-w-4xl dark:prose-invert">
        <h1>Terms and Conditions</h1>
        <p className="text-muted-foreground">
          Last updated:{" "}
          {new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        <section>
          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing or using SaaS Starter ("the Service"), you agree to be
            bound by these Terms and Conditions. If you disagree with any part
            of these terms, you may not access the Service.
          </p>
        </section>

        <section>
          <h2>2. Use License</h2>
          <p>
            Permission is granted to temporarily use SaaS Starter for personal
            or commercial projects. This license shall automatically terminate
            if you violate any of these restrictions and may be terminated at
            any time by us.
          </p>
          <p>Under this license, you may:</p>
          <ul>
            <li>Use the Service for personal and commercial purposes</li>
            <li>Modify the code to suit your needs</li>
            <li>Distribute your modified version</li>
          </ul>
          <p>You may not:</p>
          <ul>
            <li>
              Remove or alter any proprietary notices or labels on the Service
            </li>
            <li>Use the Service in any way that is unlawful or harmful</li>
            <li>
              Attempt to decompile or reverse engineer any software contained in
              the Service
            </li>
          </ul>
        </section>

        <section>
          <h2>3. User Accounts</h2>
          <p>
            When you create an account with us, you must provide accurate,
            complete, and current information. You are responsible for
            safeguarding the password and for all activities that occur under
            your account.
          </p>
          <p>
            You agree not to disclose your password to any third party and to
            take sole responsibility for any activities or actions under your
            account, whether or not you have authorized such activities or
            actions.
          </p>
        </section>

        <section>
          <h2>4. Subscription and Payment</h2>
          <p>
            If you purchase a subscription, you agree to pay the fees specified
            at the time of purchase. All fees are in USD and are non-refundable
            except as required by law.
          </p>
          <p>
            Subscriptions automatically renew unless you cancel before the
            renewal date. You may cancel your subscription at any time through
            your account settings or by contacting support.
          </p>
        </section>

        <section>
          <h2>5. Content and Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality
            are owned by SaaS Starter and are protected by international
            copyright, trademark, patent, trade secret, and other intellectual
            property laws.
          </p>
          <p>
            You retain ownership of any content you create or upload to the
            Service. By using the Service, you grant us a license to use,
            reproduce, and distribute such content as necessary to provide the
            Service.
          </p>
        </section>

        <section>
          <h2>6. Prohibited Uses</h2>
          <p>You may not use the Service:</p>
          <ul>
            <li>
              In any way that violates any applicable national or international
              law or regulation
            </li>
            <li>
              To transmit, or procure the sending of, any advertising or
              promotional material without our prior written consent
            </li>
            <li>
              To impersonate or attempt to impersonate the company, a company
              employee, another user, or any other person or entity
            </li>
            <li>
              In any way that infringes upon the rights of others, or in any way
              is illegal, threatening, fraudulent, or harmful
            </li>
          </ul>
        </section>

        <section>
          <h2>7. Disclaimer</h2>
          <p>
            The information on this Service is provided on an "as is" basis. To
            the fullest extent permitted by law, SaaS Starter excludes all
            representations, warranties, conditions, and terms relating to the
            Service.
          </p>
        </section>

        <section>
          <h2>8. Limitation of Liability</h2>
          <p>
            In no event shall SaaS Starter, nor its directors, employees,
            partners, agents, suppliers, or affiliates, be liable for any
            indirect, incidental, special, consequential, or punitive damages,
            including without limitation, loss of profits, data, use, goodwill,
            or other intangible losses, resulting from your use of the Service.
          </p>
        </section>

        <section>
          <h2>9. Indemnification</h2>
          <p>
            You agree to defend, indemnify, and hold harmless SaaS Starter and
            its licensee and licensors, and their employees, contractors,
            agents, officers and directors, from and against any and all claims,
            damages, obligations, losses, liabilities, costs or debt, and
            expenses (including but not limited to attorney's fees).
          </p>
        </section>

        <section>
          <h2>10. Termination</h2>
          <p>
            We may terminate or suspend your account and bar access to the
            Service immediately, without prior notice or liability, under our
            sole discretion, for any reason whatsoever and without limitation,
            including but not limited to a breach of the Terms.
          </p>
          <p>
            If you wish to terminate your account, you may simply discontinue
            using the Service or contact us to request account deletion.
          </p>
        </section>

        <section>
          <h2>11. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace
            these Terms at any time. If a revision is material, we will provide
            at least 30 days notice prior to any new terms taking effect.
          </p>
          <p>
            What constitutes a material change will be determined at our sole
            discretion. By continuing to access or use our Service after those
            revisions become effective, you agree to be bound by the revised
            terms.
          </p>
        </section>

        <section>
          <h2>12. Contact Information</h2>
          <p>
            If you have any questions about these Terms and Conditions, please
            contact us at{" "}
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
