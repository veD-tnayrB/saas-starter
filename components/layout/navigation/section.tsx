"use client";

import { SidebarNavItem } from "@/types";

import { NavigationItem } from "./item";

interface INavigationSectionProps {
  section: SidebarNavItem;
  isSidebarExpanded: boolean;
  path: string;
}

export function NavigationSection({
  section,
  isSidebarExpanded,
  path,
}: INavigationSectionProps) {
  const sectionTitle = isSidebarExpanded ? (
    <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">
      {section.title}
    </p>
  ) : (
    <div className="h-4" />
  );

  const items = section.items
    .filter((item) => item.href)
    .map((item) => (
      <NavigationItem
        key={item.title}
        item={item}
        isSidebarExpanded={isSidebarExpanded}
        path={path}
      />
    ));

  return (
    <section className="flex flex-col gap-0.5">
      {sectionTitle}
      {items}
    </section>
  );
}
