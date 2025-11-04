"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SidebarNavItem } from "@/types";
import { PanelLeftClose, PanelRightClose } from "lucide-react";

import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProjectSwitcher } from "@/components/dashboard/project-switcher";
import { UpgradeCard } from "@/components/dashboard/upgrade-card";
import { NavigationSections } from "@/components/layout/navigation-sections";

interface IDashboardSidebarProps {
  links: SidebarNavItem[];
}

export function DashboardSidebar({ links }: IDashboardSidebarProps) {
  const path = usePathname();

  // Initialize with server-safe default (always true to match SSR)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Read from localStorage only after mount to avoid hydration mismatch
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
                {isSidebarExpanded ? <ProjectSwitcher /> : null}

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
                <NavigationSections
                  links={links}
                  isSidebarExpanded={isSidebarExpanded}
                  path={path}
                />
              </nav>

              <div className="mt-auto xl:p-4">
                {isSidebarExpanded && <UpgradeCard />}
              </div>
            </div>
          </aside>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}
