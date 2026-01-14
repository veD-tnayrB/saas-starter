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
    ],
  },
  {
    title: "SETTINGS",
    items: [
      {
        href: "/project/[projectId]/settings",
        icon: "settings",
        title: "Project",
        authorizeOnly: "OWNER",
      },
    ],
  },
];
