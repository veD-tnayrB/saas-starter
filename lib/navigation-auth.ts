import type { INavItem } from "@/types";

/**
 * Authorization types for navigation items
 */
export type NavigationAuthType = "ADMIN" | "OWNER";

/**
 * Check if navigation item should be visible based on authorization
 */
export function canAccessNavigationItem(
  item: INavItem,
  userIsAdmin: boolean,
  userIsCurrentProjectOwner: boolean,
): boolean {
  if (!item.authorizeOnly) return true;

  if (item.authorizeOnly === "ADMIN") {
    return userIsAdmin;
  }

  if (item.authorizeOnly === "OWNER") {
    return userIsCurrentProjectOwner;
  }

  return false;
}

/**
 * Filter navigation items based on user permissions
 */
export function filterNavigationItems(
  items: INavItem[],
  userIsAdmin: boolean,
  userIsCurrentProjectOwner: boolean,
): INavItem[] {
  return items.filter((item) =>
    canAccessNavigationItem(item, userIsAdmin, userIsCurrentProjectOwner),
  );
}
