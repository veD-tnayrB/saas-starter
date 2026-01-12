import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { DeleteAccountSection } from "@/components/dashboard/delete-account";
import { DashboardHeader } from "@/components/dashboard/header";
import { UserNameForm } from "@/components/forms/user-name-form";
import { FramerWrapper } from "@/components/shared/framer-wrapper";

export const metadata = constructMetadata({
  title: "Settings – SaaS Starter",
  description: "Configure your account and website settings.",
});

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user?.id) redirect("/login");

  return (
    <FramerWrapper className="flex flex-col gap-10">
      <DashboardHeader
        heading="Settings"
        text="Manage account and website settings."
      />

      <div className="flex flex-col gap-12">
        <div className="glass-card rounded-2xl p-6">
          <UserNameForm user={{ id: user.id, name: user.name || "" }} />
        </div>

        <div className="glass-card rounded-2xl border-destructive/10 bg-destructive/5 p-6">
          <DeleteAccountSection />
        </div>
      </div>
    </FramerWrapper>
  );
}
