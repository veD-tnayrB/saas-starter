import { ISidebarNavItem } from "types";

export const sidebarLinks: ISidebarNavItem[] = [
  {
    title: "MENU",
    items: [
      {
        href: "/project/[projectId]/dashboard",
        icon: "dashboard",
        title: "Dashboard",
      },
      {
        href: "/project/[projectId]/members",
        icon: "user",
        title: "Members",
      },
      {
        href: "/project/[projectId]/admin/modules",
        icon: "package",
        title: "Modules",
        authorizeOnly: "CORE", // Only users in core projects can access modules
      },
    ],
  },
  {
    title: "SETTINGS",
    items: [
      {
        href: "/project/[projectId]/settings",
        icon: "settings",
        title: "Project",
        authorizeOnly: "ADMIN",
      },
      {
        href: "/project/[projectId]/billing",
        icon: "billing",
        title: "Billing",
        authorizeOnly: "OWNER",
      },
    ],
  },
];
