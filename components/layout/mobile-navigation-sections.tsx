"use client";

import { SidebarNavItem } from "@/types";

import { MobileNavigationSection } from "@/components/layout/mobile-navigation-section";

interface IMobileNavigationSectionsProps {
  links: SidebarNavItem[];
  path: string;
  onItemClick: () => void;
}

export function MobileNavigationSections({
  links,
  path,
  onItemClick,
}: IMobileNavigationSectionsProps) {
  const sections = links.map((section) => (
    <MobileNavigationSection
      key={section.title}
      section={section}
      path={path}
      onItemClick={onItemClick}
    />
  ));

  return <>{sections}</>;
}
