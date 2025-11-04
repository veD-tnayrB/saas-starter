import { Icons } from "@/components/shared/icons";

interface IBenefitItemProps {
  feature: string;
}

export function BenefitItem({ feature }: IBenefitItemProps) {
  return (
    <li className="flex items-start gap-x-3">
      <Icons.check className="size-5 shrink-0 text-purple-500" />
      <p>{feature}</p>
    </li>
  );
}
