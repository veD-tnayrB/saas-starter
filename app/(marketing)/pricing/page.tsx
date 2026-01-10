import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/repositories/auth/session";
import { isPlatformAdmin } from "@/services/auth/platform-admin";
import { getUserSubscriptionPlan } from "@/services/subscriptions";

import { constructMetadata } from "@/lib/utils";
import { ComparePlans } from "@/components/pricing/compare-plans";
import { PricingCards } from "@/components/pricing/pricing-cards";
import { PricingFaq } from "@/components/pricing/pricing-faq";

export const metadata = constructMetadata({
  title: "Pricing – SaaS Starter",
  description: "Explore our subscription plans.",
});

export default async function PricingPage() {
  const user = await getCurrentUser();

  if (user) {
    const userIsAdmin = await isPlatformAdmin(user.id);
    if (userIsAdmin) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center">
          <h1 className="text-5xl font-bold">Seriously?</h1>
          <Image
            src="/_static/illustrations/call-waiting.svg"
            alt="403"
            width={560}
            height={560}
            className="pointer-events-none -my-20 dark:invert"
          />
          <p className="text-balance px-4 text-center text-2xl font-medium">
            You are a platform admin. Back to{" "}
            <Link
              href="/project"
              className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Dashboard
            </Link>
            .
          </p>
        </div>
      );
    }
  }

  let subscriptionPlan;
  if (user && user.id) {
    subscriptionPlan = await getUserSubscriptionPlan(user.id);
  }

  return (
    <div className="flex w-full flex-col gap-16 py-8 md:py-8">
      <PricingCards userId={user?.id} subscriptionPlan={subscriptionPlan} />
      <hr className="container" />
      <ComparePlans />
      <PricingFaq />
    </div>
  );
}
