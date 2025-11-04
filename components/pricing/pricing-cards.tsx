"use client";

import { useContext, useState } from "react";
import { UserSubscriptionPlan } from "@/types";

import { pricingData } from "@/config/subscriptions";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ModalContext } from "@/components/modals/providers";
import { PricingCard } from "@/components/pricing/card";
import { HeaderSection } from "@/components/shared/header-section";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

interface IPricingCardsProps {
  userId?: string;
  subscriptionPlan?: UserSubscriptionPlan;
}

export function PricingCards({ userId, subscriptionPlan }: IPricingCardsProps) {
  const hasSubscription = !!subscriptionPlan?.stripeCustomerId;
  const isDefaultYearly =
    !hasSubscription || subscriptionPlan?.interval === "year";
  const [isYearly, setIsYearly] = useState<boolean>(isDefaultYearly);
  const { setShowSignInModal } = useContext(ModalContext);

  function toggleBilling() {
    setIsYearly(!isYearly);
  }

  const pricingCards = pricingData.map((offer) => (
    <PricingCard
      key={offer.title}
      offer={offer}
      isYearly={isYearly}
      userId={userId}
      subscriptionPlan={subscriptionPlan}
      onSignIn={() => setShowSignInModal(true)}
    />
  ));

  const toggleValue = isYearly ? "yearly" : "monthly";

  return (
    <MaxWidthWrapper>
      <section className="flex flex-col items-center text-center">
        <HeaderSection label="Pricing" title="Start at full speed !" />

        <div className="mb-4 mt-10 flex items-center gap-5">
          <ToggleGroup
            type="single"
            size="sm"
            defaultValue={toggleValue}
            onValueChange={toggleBilling}
            aria-label="toggle-year"
            className="h-9 overflow-hidden rounded-full border bg-background p-1 *:h-7 *:text-muted-foreground"
          >
            <ToggleGroupItem
              value="yearly"
              className="rounded-full px-5 data-[state=on]:!bg-primary data-[state=on]:!text-primary-foreground"
              aria-label="Toggle yearly billing"
            >
              Yearly (-20%)
            </ToggleGroupItem>
            <ToggleGroupItem
              value="monthly"
              className="rounded-full px-5 data-[state=on]:!bg-primary data-[state=on]:!text-primary-foreground"
              aria-label="Toggle monthly billing"
            >
              Monthly
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="grid gap-5 bg-inherit py-5 lg:grid-cols-3">
          {pricingCards}
        </div>

        <p className="mt-3 text-balance text-center text-base text-muted-foreground">
          Email{" "}
          <a
            className="font-medium text-primary hover:underline"
            href="mailto:support@saas-starter.com"
          >
            support@saas-starter.com
          </a>{" "}
          for to contact our support team.
          <br />
          <strong>
            You can test the subscriptions and won&apos;t be charged.
          </strong>
        </p>
      </section>
    </MaxWidthWrapper>
  );
}
