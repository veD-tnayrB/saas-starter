import { SidebarNavItem } from "types";

export const sidebarLinks: SidebarNavItem[] = [
  {
    title: "MENU",
    items: [
      {
        href: "/admin",
        icon: "laptop",
        title: "Admin Panel",
        authorizeOnly: "ADMIN", // Platform admin (any project owner/admin)
      },
      { href: "/dashboard", icon: "dashboard", title: "Dashboard" },
      {
        href: "/dashboard/[projectId]/billing",
        icon: "billing",
        title: "Billing",
        authorizeOnly: "OWNER", // Only project owners can access billing
      },
    ],
  },
  {
    title: "OPTIONS",
    items: [
      { href: "/dashboard/settings", icon: "settings", title: "Settings" },
      { href: "/", icon: "home", title: "Homepage" },
      { href: "/docs", icon: "bookOpen", title: "Documentation" },
    ],
  },
];
