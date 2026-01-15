import { getCurrentUser } from "@/repositories/auth/session";
import { findFirstUserProjectId } from "@/repositories/projects/project";

import { NavMobile } from "@/components/layout/mobile-nav";
import { NavBar } from "@/components/layout/navbar";
import { SiteFooter } from "@/components/layout/site-footer";

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export default async function MarketingLayout({
  children,
}: MarketingLayoutProps) {
  const user = await getCurrentUser();
  let dashboardHref = "/project";

  if (user) {
    const firstProjectId = await findFirstUserProjectId(user.id);
    if (firstProjectId) {
      dashboardHref = `/project/${firstProjectId}/dashboard`;
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <NavMobile />
      <NavBar scroll={true} dashboardHref={dashboardHref} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
