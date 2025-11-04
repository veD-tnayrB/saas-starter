import { Icons } from "@/components/shared/icons";

interface ILimitationItemProps {
  feature: string;
}

export function LimitationItem({ feature }: ILimitationItemProps) {
  return (
    <li className="flex items-start text-muted-foreground">
      <Icons.close className="mr-3 size-5 shrink-0" />
      <p>{feature}</p>
    </li>
  );
}
