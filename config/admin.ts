import { ISidebarNavItem } from "types";

export const adminSidebarLinks: ISidebarNavItem[] = [
  {
    title: "SYSTEM",
    items: [
      {
        href: "/admin",
        icon: "dashboard",
        title: "Overview",
      },
      {
        href: "/admin/analytics",
        icon: "billing",
        title: "Analytics",
      },
    ],
  },
  {
    title: "ACCESS CONTROL",
    items: [
      {
        href: "/admin/actions",
        icon: "settings",
        title: "Actions",
      },
      {
        href: "/admin/roles",
        icon: "user",
        title: "Roles",
      },
      {
        href: "/admin/pricing",
        icon: "billing",
        title: "Pricing Plans",
      },
    ],
  },
];
