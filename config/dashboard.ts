import { ISidebarNavItem } from "types";

export const sidebarLinks: ISidebarNavItem[] = [
  {
    title: "MENU",
    items: [
      {
        href: "/dashboard/[projectId]",
        icon: "dashboard",
        title: "Dashboard",
      },

      {
        href: "/dashboard/[projectId]/billing",
        icon: "billing",
        title: "Billing",
        authorizeOnly: "OWNER", // Only project owners can access billing
      },
      {
        href: "/dashboard/[projectId]/admin/modules",
        icon: "package",
        title: "Modules",
        authorizeOnly: "CORE", // Only users in core projects can access modules
      },
    ],
  },
  {
    title: "OPTIONS",
    items: [
      {
        href: "/projects",
        icon: "package",
        title: "Projects",
      },

      { href: "/settings", icon: "settings", title: "Settings" },
      { href: "/", icon: "home", title: "Homepage" },
      { href: "/docs", icon: "bookOpen", title: "Documentation" },
    ],
  },
];
