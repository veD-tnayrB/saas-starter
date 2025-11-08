import { cache } from "react";
import { isPlatformAdmin } from "@/services/auth/platform-admin";

import { UpgradeCard } from "@/components/dashboard/upgrade-card";

interface IUpgradeCardSectionProps {
  userId: string;
}

const checkAdmin = cache(async (userId: string) => {
  return isPlatformAdmin(userId);
});

export async function UpgradeCardSection({ userId }: IUpgradeCardSectionProps) {
  const isAdmin = await checkAdmin(userId);
  return <UpgradeCard isAdmin={isAdmin} />;
}
