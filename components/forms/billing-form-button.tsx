"use client";

import { useTransition } from "react";
import { generateUserStripe } from "@/actions/generate-user-stripe";
import { ISubscriptionPlan, IUserSubscriptionPlan } from "@/types";

import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";

interface IBillingFormButtonProps {
  offer: ISubscriptionPlan;
  subscriptionPlan: IUserSubscriptionPlan;
  year: boolean;
}

export function BillingFormButton({
  year,
  offer,
  subscriptionPlan,
}: IBillingFormButtonProps) {
  let [isPending, startTransition] = useTransition();
  const generateUserStripeSession = generateUserStripe.bind(
    null,
    offer.stripeIds[year ? "yearly" : "monthly"],
  );

  const stripeSessionAction = () =>
    startTransition(async () => await generateUserStripeSession());

  const userOffer =
    subscriptionPlan.stripePriceId ===
    offer.stripeIds[year ? "yearly" : "monthly"];

  const buttonVariant = userOffer ? "default" : "outline";
  const buttonText = userOffer ? "Manage Subscription" : "Upgrade";
  const buttonContent = isPending ? (
    <>
      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> Loading...
    </>
  ) : (
    buttonText
  );

  return (
    <Button
      variant={buttonVariant}
      rounded="full"
      className="w-full"
      disabled={isPending}
      onClick={stripeSessionAction}
    >
      {buttonContent}
    </Button>
  );
}
