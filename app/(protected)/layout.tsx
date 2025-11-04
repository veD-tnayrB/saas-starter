import { redirect } from "next/navigation";
import { getCurrentUser } from "@/repositories/auth/session";

import { sidebarLinks } from "@/config/dashboard";
import { filterNavigationItems } from "@/lib/navigation-auth";
import { SearchCommand } from "@/components/dashboard/search-command";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { MobileSheetSidebar } from "@/components/layout/mobile-sheet-sidebar";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { UserAccountNav } from "@/components/layout/user-account-nav";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function Dashboard({ children }: ProtectedLayoutProps) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const { isPlatformAdmin } = await import("@/services/auth/platform-admin");
  const userIsAdmin = await isPlatformAdmin(user.id);

  // Filter links for ADMIN (OWNER filtering is done in client component)
  // OWNER filtering requires pathname which is only available in client components
  const filteredLinks = sidebarLinks.map((section) => ({
    ...section,
    items: filterNavigationItems(section.items, userIsAdmin, false),
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
