"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarNavItem } from "@/types";
import { Menu, PanelLeftClose, PanelRightClose } from "lucide-react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProjectSwitcher } from "@/components/dashboard/project-switcher";
import { UpgradeCard } from "@/components/dashboard/upgrade-card";
import { Icons } from "@/components/shared/icons";

interface DashboardSidebarProps {
  links: SidebarNavItem[];
}

export function DashboardSidebar({ links }: DashboardSidebarProps) {
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

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

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
                {links.map((section) => (
                  <section
                    key={section.title}
                    className="flex flex-col gap-0.5"
                  >
                    {isSidebarExpanded ? (
                      <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">
                        {section.title}
                      </p>
                    ) : (
                      <div className="h-4" />
                    )}
                    {section.items.map((item) => {
                      const Icon = Icons[item.icon || "arrowRight"];
                      return (
                        item.href && (
                          <Fragment key={`link-fragment-${item.title}`}>
                            {isSidebarExpanded ? (
                              <Link
                                key={`link-${item.title}`}
                                href={item.disabled ? "#" : item.href}
                                className={cn(
                                  "flex items-center gap-3 rounded-md p-2 text-sm font-medium transition-colors hover:bg-muted",
                                  path === item.href
                                    ? "bg-muted text-foreground"
                                    : "text-foreground/70 hover:text-foreground",
                                  item.disabled &&
                                    "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-foreground/50",
                                )}
                              >
                                <Icon
                                  className={cn(
                                    "size-5",
                                    path === item.href
                                      ? "text-foreground"
                                      : "text-foreground/70",
                                  )}
                                />
                                {item.title}
                                {item.badge && (
                                  <Badge className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-full">
                                    {item.badge}
                                  </Badge>
                                )}
                              </Link>
                            ) : (
                              <Tooltip key={`tooltip-${item.title}`}>
                                <TooltipTrigger asChild>
                                  <Link
                                    key={`link-tooltip-${item.title}`}
                                    href={item.disabled ? "#" : item.href}
                                    className={cn(
                                      "flex items-center gap-3 rounded-md py-2 text-sm font-medium transition-colors hover:bg-muted",
                                      path === item.href
                                        ? "bg-muted text-foreground"
                                        : "text-foreground/70 hover:text-foreground",
                                      item.disabled &&
                                        "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-foreground/50",
                                    )}
                                  >
                                    <span className="flex size-full items-center justify-center">
                                      <Icon
                                        className={cn(
                                          "size-5",
                                          path === item.href
                                            ? "text-foreground"
                                            : "text-foreground/70",
                                        )}
                                      />
                                    </span>
                                  </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                  {item.title}
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </Fragment>
                        )
                      );
                    })}
                  </section>
                ))}
              </nav>

              <div className="mt-auto xl:p-4">
                {isSidebarExpanded ? <UpgradeCard /> : null}
              </div>
            </div>
          </aside>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}

export function MobileSheetSidebar({ links }: DashboardSidebarProps) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const { isSm, isMobile } = useMediaQuery();

  if (isSm || isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="size-9 shrink-0 md:hidden"
          >
            <Menu className="size-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0">
          <ScrollArea className="h-full overflow-y-auto">
            <div className="flex h-screen flex-col">
              <nav className="flex flex-1 flex-col gap-y-8 p-6 text-lg font-medium">
                <Link
                  href="#"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <Icons.logo className="size-6" />
                  <span className="font-urban text-xl font-bold">
                    {siteConfig.name}
                  </span>
                </Link>

                <ProjectSwitcher large />

                {links.map((section) => (
                  <section
                    key={section.title}
                    className="flex flex-col gap-0.5"
                  >
                    <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">
                      {section.title}
                    </p>

                    {section.items.map((item) => {
                      const Icon = Icons[item.icon || "arrowRight"];
                      return (
                        item.href && (
                          <Fragment key={`link-fragment-${item.title}`}>
                            <Link
                              key={`link-${item.title}`}
                              onClick={() => {
                                if (!item.disabled) setOpen(false);
                              }}
                              href={item.disabled ? "#" : item.href}
                              className={cn(
                                "flex items-center gap-3 rounded-md p-2 text-sm font-medium transition-colors hover:bg-muted",
                                path === item.href
                                  ? "bg-muted text-foreground"
                                  : "text-foreground/70 hover:text-foreground",
                                item.disabled &&
                                  "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-foreground/50",
                              )}
                            >
                              <Icon
                                className={cn(
                                  "size-5",
                                  path === item.href
                                    ? "text-foreground"
                                    : "text-foreground/70",
                                )}
                              />
                              {item.title}
                              {item.badge && (
                                <Badge className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-full">
                                  {item.badge}
                                </Badge>
                              )}
                            </Link>
                          </Fragment>
                        )
                      );
                    })}
                  </section>
                ))}

                <div className="mt-auto">
                  <UpgradeCard />
                </div>
              </nav>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="flex size-9 animate-pulse rounded-lg bg-muted md:hidden" />
  );
}
