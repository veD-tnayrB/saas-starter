import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface IUpgradeCardProps {
  isAdmin: boolean;
}

export function UpgradeCard({ isAdmin }: IUpgradeCardProps) {
  const title = isAdmin ? "Manage billing" : "Upgrade to Pro";
  const description = isAdmin
    ? "Configure plans, review invoices, and manage subscription settings."
    : "Unlock all features and get unlimited access to our support team.";
  const buttonLabel = isAdmin ? "Go to billing" : "Upgrade";

  return (
    <Card className="md:max-xl:rounded-none md:max-xl:border-none md:max-xl:shadow-none">
      <CardHeader className="md:max-xl:px-4">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="md:max-xl:px-4">
        <Button
          size="sm"
          className="bg-gradient-silver hover:shadow-silver-lg transition-silver hover-lift w-full text-background shadow-silver"
        >
          {buttonLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
