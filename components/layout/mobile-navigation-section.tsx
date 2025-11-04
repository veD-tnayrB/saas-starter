"use client";

import { SidebarNavItem } from "@/types";

import { MobileNavigationItem } from "@/components/layout/mobile-navigation-item";

interface IMobileNavigationSectionProps {
  section: SidebarNavItem;
  path: string;
  onItemClick: () => void;
}

export function MobileNavigationSection({
  section,
  path,
  onItemClick,
}: IMobileNavigationSectionProps) {
  const items = section.items
    .filter((item) => item.href)
    .map((item) => (
      <MobileNavigationItem
        key={item.title}
        item={item}
        path={path}
        onItemClick={onItemClick}
      />
    ));

  return (
    <section className="flex flex-col gap-0.5">
      <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">
        {section.title}
      </p>
      {items}
    </section>
  );
}
