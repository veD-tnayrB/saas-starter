"use client";

import { SidebarNavItem } from "@/types";

import { canAccessNavigationItem } from "@/lib/navigation-auth";

import { MobileNavigationItem } from "./item";

interface IMobileNavigationSectionProps {
  section: SidebarNavItem;
  path: string;
  onItemClick: () => void;
  currentProjectId: string | null;
  isCurrentProjectOwner: boolean;
}

export function MobileNavigationSection({
  section,
  path,
  onItemClick,
  currentProjectId,
  isCurrentProjectOwner,
}: IMobileNavigationSectionProps) {
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
        <MobileNavigationItem
          key={item.title}
          item={{ ...item, href }}
          path={path}
          onItemClick={onItemClick}
        />
      );
    });

  return (
    <section className="flex flex-col gap-0.5">
      <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">
        {section.title}
      </p>
      {items}
    </section>
  );
}
