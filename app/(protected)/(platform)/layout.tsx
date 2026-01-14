import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/repositories/auth/session";
import { isPlatformAdmin, isSystemAdmin } from "@/services/auth/platform-admin";
import { isUserProjectOwner } from "@/services/projects/is-user-project-owner";

import { sidebarLinks } from "@/config/dashboard";
import { filterNavigationItems } from "@/lib/navigation-auth";
import { SearchCommand } from "@/components/dashboard/search-command";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { MobileSheetSidebar } from "@/components/layout/mobile-sheet-sidebar";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { NotificationsNav } from "@/components/layout/notifications-nav";
import { UserAccountNav } from "@/components/layout/user-account-nav";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

// Platform layout with navigation and project switching
interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function Dashboard({ children }: ProtectedLayoutProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const requestHeaders = await headers();
  const referer = requestHeaders.get("referer") ?? "";
  const projectIdMatch = referer.match(/\/project\/([a-zA-Z0-9-]+)/);
  const projectId = projectIdMatch ? projectIdMatch[1] : null;

  const [userIsAdmin, userIsSystemAdmin, userIsOwner] = await Promise.all([
    isPlatformAdmin(user.id),
    isSystemAdmin(user.id),
    projectId ? isUserProjectOwner(user.id, projectId) : Promise.resolve(false),
  ]);

  // Filter links based on roles
  const filteredLinks = sidebarLinks.map((section) => ({
    ...section,
    items: filterNavigationItems(
      section.items,
      userIsAdmin,
      userIsOwner,
      userIsSystemAdmin,
    ),
  }));

  return (
    <div className="relative flex min-h-screen w-full">
      <DashboardSidebar links={filteredLinks} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="glass sticky top-0 z-50 flex h-14 px-4 lg:h-[60px] xl:px-8">
          <MaxWidthWrapper className="flex max-w-7xl items-center gap-x-3 px-0">
            <MobileSheetSidebar links={filteredLinks} />

            <div className="w-full flex-1">
              <SearchCommand links={filteredLinks} />
            </div>

            <ModeToggle />
            <NotificationsNav />
            <UserAccountNav isSystemAdmin={userIsSystemAdmin} />
          </MaxWidthWrapper>
        </header>

        <main className="bg-grid relative flex-1 p-4 xl:px-8">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/0 via-background/50 to-background" />
          <MaxWidthWrapper className="relative flex h-full max-w-7xl flex-col gap-4 px-0 lg:gap-6">
            {children}
          </MaxWidthWrapper>
        </main>
      </div>
    </div>
  );
}
