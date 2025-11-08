"use client";

import { ISidebarNavItem } from "@/types";

import { canAccessNavigationItem } from "@/lib/navigation-auth";

import { NavigationItem } from "./item";

interface INavigationSectionProps {
  section: ISidebarNavItem;
  isSidebarExpanded: boolean;
  path: string;
  projectId: string | null;
  hasExplicitProject: boolean;
  isCurrentProjectOwner: boolean;
}

export function NavigationSection({
  section,
  isSidebarExpanded,
  path,
  projectId,
  hasExplicitProject,
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

      // Always show items, even if they require projectId (we'll use fallback)
      // Filter OWNER items: only show if user is OWNER of current project
      // ADMIN items are already filtered in server component
      return canAccessNavigationItem(item, true, isCurrentProjectOwner);
    })
    .map((item) => {
      let href = item.href;
      let isFallback = false;

      if (typeof item.href === "string" && item.href.includes("[projectId]")) {
        if (projectId) {
          href = item.href.replace("[projectId]", projectId);
          isFallback = !hasExplicitProject;
        } else {
          href = "/projects";
          isFallback = true;
        }
      }

      return (
        <NavigationItem
          key={item.title}
          item={item}
          isSidebarExpanded={isSidebarExpanded}
          path={path}
          href={href}
          isFallback={isFallback}
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
