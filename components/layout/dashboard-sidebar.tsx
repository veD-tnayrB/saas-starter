"use client";

import {
  cloneElement,
  isValidElement,
  ReactElement,
  useEffect,
  useState,
} from "react";
import { useParams, usePathname } from "next/navigation";
import {
  isClientPlatformAdmin,
  isClientSystemAdmin,
} from "@/actions/auth/admin-actions";
import { isCurrentProjectOwner } from "@/actions/projects/is-owner-action";
import { ISidebarNavItem } from "@/types";
import { PanelLeftClose, PanelRightClose } from "lucide-react";

import { filterNavigationItems } from "@/lib/navigation-auth";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProjectSwitcher } from "@/components/dashboard/project/switcher";
import { Navigation } from "@/components/layout/navigation";

interface IDashboardSidebarProps {
  links: ISidebarNavItem[];
  header?: React.ReactNode;
}

export function DashboardSidebar({ links, header }: IDashboardSidebarProps) {
  const path = usePathname();
  const params = useParams();
  const projectId = params.projectId as string | undefined;

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Client-side permission checking
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCore, setIsCore] = useState(false);
  const [loadingPermissions, setLoadingPermissions] = useState(true);

  useEffect(() => {
    async function checkPermissions() {
      setLoadingPermissions(true);

      const ownerPromise = projectId
        ? isCurrentProjectOwner(projectId)
        : Promise.resolve(false);
      const adminPromise = isClientPlatformAdmin();
      const corePromise = isClientSystemAdmin();

      const [ownerResult, adminResult, coreResult] = await Promise.all([
        ownerPromise,
        adminPromise,
        corePromise,
      ]);

      setIsOwner(ownerResult);
      setIsAdmin(adminResult);
      setIsCore(coreResult);
      setLoadingPermissions(false);
    }

    checkPermissions();
  }, [projectId]);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("sidebarExpanded");
      if (saved !== null) {
        setIsSidebarExpanded(JSON.parse(saved));
      }
    }
  }, []);

  useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      window.localStorage.setItem(
        "sidebarExpanded",
        JSON.stringify(isSidebarExpanded),
      );
    }
  }, [isSidebarExpanded, mounted]);

  const { isTablet } = useMediaQuery();

  function toggleSidebar() {
    setIsSidebarExpanded(!isSidebarExpanded);
  }

  useEffect(() => {
    if (mounted) {
      setIsSidebarExpanded(!isTablet);
    }
  }, [isTablet, mounted]);

  // Filter links on the client side based on fetched permissions
  const filteredLinks = links.map((section) => ({
    ...section,
    items: filterNavigationItems(section.items, isAdmin, isOwner, isCore),
  }));

  return (
    <TooltipProvider delayDuration={0}>
      <div className="sticky top-0 h-full">
        <ScrollArea className="h-full overflow-y-auto border-r">
          <aside
            className={cn(
              isSidebarExpanded ? "w-[220px] xl:w-[260px]" : "w-[68px]",
              "hidden h-screen md:block",
            )}
          >
            <div className="flex h-full max-h-screen flex-1 flex-col gap-2">
              <div className="flex h-14 items-center p-4 lg:h-[60px]">
                {header && isValidElement(header)
                  ? cloneElement(header as ReactElement<any>, {
                      isCollapsed: !isSidebarExpanded,
                    })
                  : header || (isSidebarExpanded && <ProjectSwitcher />)}

                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto size-9 lg:size-8"
                  onClick={toggleSidebar}
                >
                  {isSidebarExpanded ? (
                    <PanelLeftClose
                      size={18}
                      className="stroke-muted-foreground"
                    />
                  ) : (
                    <PanelRightClose
                      size={18}
                      className="stroke-muted-foreground"
                    />
                  )}
                  <span className="sr-only">Toggle Sidebar</span>
                </Button>
              </div>

              <nav className="flex flex-1 flex-col gap-8 px-4 pt-4">
                {loadingPermissions ? null : (
                  <Navigation
                    links={filteredLinks}
                    isSidebarExpanded={isSidebarExpanded}
                    path={path}
                  />
                )}
              </nav>
            </div>
          </aside>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}
