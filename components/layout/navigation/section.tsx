"use client";

import { SidebarNavItem } from "@/types";

import { canAccessNavigationItem } from "@/lib/navigation-auth";

import { NavigationItem } from "./item";

interface INavigationSectionProps {
  section: SidebarNavItem;
  isSidebarExpanded: boolean;
  path: string;
  currentProjectId: string | null;
  isCurrentProjectOwner: boolean;
}

export function NavigationSection({
  section,
  isSidebarExpanded,
  path,
  currentProjectId,
  isCurrentProjectOwner,
}: INavigationSectionProps) {
  const sectionTitle = isSidebarExpanded ? (
    <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">
      {section.title}
    </p>
  ) : (
    <div className="h-4" />
  );

  const items = section.items
    .filter((item) => {
      if (!item.href) return false;

      // Hide items that require projectId if no projectId is available
      if (item.href.includes("[projectId]") && !currentProjectId) {
        return false;
      }

      // Filter OWNER items: only show if user is OWNER of current project
      // ADMIN items are already filtered in server component
      return canAccessNavigationItem(item, true, isCurrentProjectOwner);
    })
    .map((item) => {
      // Replace [projectId] placeholder with actual projectId
      const href = item.href.includes("[projectId]")
        ? item.href.replace("[projectId]", currentProjectId || "")
        : item.href;

      return (
        <NavigationItem
          key={item.title}
          item={{ ...item, href }}
          isSidebarExpanded={isSidebarExpanded}
          path={path}
        />
      );
    });

  return (
    <section className="flex flex-col gap-0.5">
      {sectionTitle}
      {items}
    </section>
  );
}
