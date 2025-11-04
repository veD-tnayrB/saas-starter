import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

import { Icons } from "../components/shared/icons";

interface ISubscriptionConfirmationEmailProps {
  userName: string;
  planName: string;
  planPrice: number;
  interval: "month" | "year";
  billingPortalUrl: string;
  dashboardUrl: string;
  siteName: string;
  nextBillingDate: string;
}

export function SubscriptionConfirmationEmail({
  userName,
  planName,
  planPrice,
  interval,
  billingPortalUrl,
  dashboardUrl,
  siteName,
  nextBillingDate,
}: ISubscriptionConfirmationEmailProps) {
  const priceDisplay = `$${planPrice}${interval === "month" ? "/month" : "/year"}`;
  const intervalDisplay = interval === "month" ? "monthly" : "yearly";

  return (
    <Html>
      <Head />
      <Preview>
        Your {planName} subscription to {siteName} is now active!
      </Preview>
      <Tailwind>
        <Body className="bg-[#0D0D0D] font-sans">
          <Container className="mx-auto px-6 py-8">
            {/* Header with logo */}
            <Section className="mb-8 text-center">
              <Icons.logo className="m-auto block size-12 fill-[#C0C0C0]" />
            </Section>

            {/* Main content */}
            <Section className="mb-6 rounded-lg bg-[#1A1A1A] p-8">
              <Text className="mb-4 text-2xl font-bold text-[#F5F5F5]">
                Subscription Confirmed! 🎉
              </Text>
              <Text className="mb-4 text-base leading-relaxed text-[#F5F5F5]">
                Hello <strong className="text-[#C0C0C0]">{userName}</strong>,
              </Text>
              <Text className="mb-4 text-base leading-relaxed text-[#F5F5F5]">
                Thank you for subscribing to {siteName}! Your{" "}
                <strong className="text-[#C0C0C0]">{planName}</strong> plan is
                now active and you have full access to all premium features.
              </Text>

              {/* Plan details */}
              <Section className="mb-6 rounded-lg border border-[#2C2C2C] bg-[#0D0D0D] p-6">
                <Text className="mb-3 text-lg font-semibold text-[#F5F5F5]">
                  Subscription Details
                </Text>
                <Text className="mb-2 text-base text-[#C0C0C0]">
                  <strong className="text-[#F5F5F5]">Plan:</strong> {planName}
                </Text>
                <Text className="mb-2 text-base text-[#C0C0C0]">
                  <strong className="text-[#F5F5F5]">Price:</strong>{" "}
                  {priceDisplay}
                </Text>
                <Text className="mb-2 text-base text-[#C0C0C0]">
                  <strong className="text-[#F5F5F5]">Billing:</strong>{" "}
                  {intervalDisplay}
                </Text>
                <Text className="mb-0 text-base text-[#C0C0C0]">
                  <strong className="text-[#F5F5F5]">Next billing date:</strong>{" "}
                  {nextBillingDate}
                </Text>
              </Section>

              {/* CTA Buttons */}
              <Section className="my-8 flex flex-col gap-3 text-center sm:flex-row sm:justify-center">
                <Button
                  className="inline-block rounded-full bg-gradient-to-r from-[#6B6B6B] to-[#A0A0A0] px-8 py-3 text-base font-semibold text-[#0D0D0D] no-underline shadow-lg"
                  href={dashboardUrl}
                >
                  Go to Dashboard
                </Button>
                <Button
                  className="inline-block rounded-full border border-[#2C2C2C] bg-[#1A1A1A] px-8 py-3 text-base font-semibold text-[#C0C0C0] no-underline"
                  href={billingPortalUrl}
                >
                  Manage Billing
                </Button>
              </Section>

              <Text className="mt-6 text-sm text-[#A0A0A0]">
                Need help? Contact our support team at{" "}
                <a
                  href={`mailto:support@${siteName.toLowerCase().replace(/\s+/g, "")}.com`}
                  className="text-[#C0C0C0] underline"
                >
                  support@{siteName.toLowerCase().replace(/\s+/g, "")}.com
                </a>
              </Text>
            </Section>

            {/* Footer */}
            <Hr className="my-6 border-t border-[#2C2C2C]" />
            <Section className="text-center">
              <Text className="mb-2 text-xs text-[#737373]">
                This is a confirmation of your subscription to {planName} on{" "}
                {siteName}.
              </Text>
              <Text className="mb-2 text-xs text-[#737373]">
                You can manage your subscription and billing information anytime
                from your account settings.
              </Text>
              <Text className="text-xs text-[#737373]">
                © {new Date().getFullYear()} {siteName}. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
