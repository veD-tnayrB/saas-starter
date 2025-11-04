"use client";

import { SidebarNavItem } from "@/types";

import { NavigationSection } from "@/components/layout/navigation-section";

interface INavigationSectionsProps {
  links: SidebarNavItem[];
  isSidebarExpanded: boolean;
  path: string;
}

export function NavigationSections({
  links,
  isSidebarExpanded,
  path,
}: INavigationSectionsProps) {
  const sections = links.map((section) => (
    <NavigationSection
      key={section.title}
      section={section}
      isSidebarExpanded={isSidebarExpanded}
      path={path}
    />
  ));

  return <>{sections}</>;
}
