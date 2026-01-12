import { adminSidebarLinks } from "@/config/admin";
import { filterNavigationItems } from "@/lib/navigation-auth";
import { getSession } from "@/lib/session";
import {
  AdminHeaderBadge,
  AdminSidebarHeader,
} from "@/components/admin/layout/headers";
import { SearchCommand } from "@/components/dashboard/search-command";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { MobileSheetSidebar } from "@/components/layout/mobile-sheet-sidebar";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { UserAccountNav } from "@/components/layout/user-account-nav";
import Providers from "@/components/providers";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getSession();

  // Admin links don't need extensive filtering like project links (yet)
  // But we keep the filter function for consistency and future role checks
  const filteredLinks = adminSidebarLinks.map((section) => ({
    ...section,
    items: filterNavigationItems(section.items, true, false),
  }));

  return (
    <Providers session={session}>
      <div className="relative flex min-h-screen w-full">
        <DashboardSidebar
          links={filteredLinks}
          header={<AdminSidebarHeader />}
        />

        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="glass sticky top-0 z-50 flex h-14 px-4 lg:h-[60px] xl:px-8">
            <MaxWidthWrapper className="flex max-w-7xl items-center gap-x-3 px-0">
              <MobileSheetSidebar
                links={filteredLinks}
                header={<AdminSidebarHeader />}
              />

              <div className="flex flex-1 items-center gap-4">
                <div className="w-full flex-1">
                  <SearchCommand links={filteredLinks} />
                </div>
              </div>

              <div className="hidden md:block">
                <AdminHeaderBadge />
              </div>
              <ModeToggle />
              <UserAccountNav />
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
    </Providers>
  );
}
