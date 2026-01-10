import { redirect } from "next/navigation";
import { getCurrentUser } from "@/repositories/auth/session";
import { isSystemAdmin } from "@/services/auth/platform-admin";

import { adminSidebarLinks } from "@/config/admin";
import { filterNavigationItems } from "@/lib/navigation-auth";
import { SearchCommand } from "@/components/dashboard/search-command";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { MobileSheetSidebar } from "@/components/layout/mobile-sheet-sidebar";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { UserAccountNav } from "@/components/layout/user-account-nav";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const userIsAdmin = await isSystemAdmin(user.id);

  if (!userIsAdmin) {
    redirect("/"); // Or a dedicated 403 page
  }

  // Admin links don't need extensive filtering like project links (yet)
  // But we keep the filter function for consistency and future role checks
  const filteredLinks = adminSidebarLinks.map((section) => ({
    ...section,
    items: filterNavigationItems(section.items, true, false),
  }));

  return (
    <div className="relative flex min-h-screen w-full">
      <DashboardSidebar links={filteredLinks} />

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-50 flex h-14 bg-background px-4 lg:h-[60px] xl:px-8">
          <MaxWidthWrapper className="flex max-w-7xl items-center gap-x-3 px-0">
            <MobileSheetSidebar links={filteredLinks} />

            <div className="w-full flex-1">
              <SearchCommand links={filteredLinks} />
            </div>

            <ModeToggle />
            <UserAccountNav />
          </MaxWidthWrapper>
        </header>

        <main className="flex-1 p-4 xl:px-8">
          <MaxWidthWrapper className="flex h-full max-w-7xl flex-col gap-4 px-0 lg:gap-6">
            {children}
          </MaxWidthWrapper>
        </main>
      </div>
    </div>
  );
}
