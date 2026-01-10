"use client";

import Link from "next/link";
import { IUserSubscriptionPlan } from "@/types";

import { ISubscriptionPlan } from "@/types/index";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { BillingFormButton } from "@/components/forms/billing-form-button";

import { BenefitItem } from "./benefit-item";
import { LimitationItem } from "./limitation-item";

interface IPricingCardProps {
  offer: ISubscriptionPlan;
  isYearly: boolean;
  userId?: string;
  subscriptionPlan?: IUserSubscriptionPlan;
  onSignIn: () => void;
}

export function PricingCard({
  offer,
  isYearly,
  userId,
  subscriptionPlan,
  onSignIn,
}: IPricingCardProps) {
  const isProPlan = offer.title.toLocaleLowerCase() === "pro";
  const hasMonthlyPrice = offer.prices.monthly > 0;
  const isStarterPlan = offer.title === "Starter";
  const hasUserSubscription = userId && subscriptionPlan;
  const showYearlyPrice = isYearly && hasMonthlyPrice;

  const priceDisplay = showYearlyPrice
    ? `$${offer.prices.yearly / 12}`
    : `$${offer.prices.monthly}`;
  const originalPrice = showYearlyPrice ? `$${offer.prices.monthly}` : null;
  const billingNote = showYearlyPrice
    ? `$${offer.prices.yearly} will be charged when annual`
    : "when charged monthly";

  const benefitItems = offer.benefits.map((feature) => (
    <BenefitItem key={feature} feature={feature} />
  ));

  const limitationItems = offer.limitations.map((feature) => (
    <LimitationItem key={feature} feature={feature} />
  ));

  const buttonVariant = isProPlan ? "default" : "outline";
  const borderClass = isProPlan ? "-m-0.5 border-2 border-purple-400" : "";

  const actionButton = hasUserSubscription ? (
    isStarterPlan ? (
      <Link
        href="/project"
        className={cn(
          buttonVariants({
            variant: "outline",
            rounded: "full",
          }),
          "w-full",
        )}
      >
        Go to dashboard
      </Link>
    ) : (
      <BillingFormButton
        year={isYearly}
        offer={offer}
        subscriptionPlan={subscriptionPlan}
      />
    )
  ) : (
    <Button variant={buttonVariant} rounded="full" onClick={onSignIn}>
      Sign in
    </Button>
  );

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-3xl border shadow-sm",
        borderClass,
      )}
    >
      <div className="min-h-[150px] items-start space-y-4 bg-muted/50 p-6">
        <p className="flex font-urban text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {offer.title}
        </p>

        <div className="flex flex-row">
          <div className="flex items-end">
            <div className="flex text-left text-3xl font-semibold leading-6">
              {showYearlyPrice && originalPrice && (
                <span className="mr-2 text-muted-foreground/80 line-through">
                  {originalPrice}
                </span>
              )}
              <span>{priceDisplay}</span>
            </div>
            <div className="-mb-1 ml-2 text-left text-sm font-medium text-muted-foreground">
              <div>/month</div>
            </div>
          </div>
        </div>
        {hasMonthlyPrice && (
          <div className="text-left text-sm text-muted-foreground">
            {billingNote}
          </div>
        )}
      </div>

      <div className="flex h-full flex-col justify-between gap-16 p-6">
        <ul className="space-y-2 text-left text-sm font-medium leading-normal">
          {benefitItems}
          {limitationItems}
        </ul>

        {actionButton}
      </div>
    </div>
  );
}
