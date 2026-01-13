"use server";

import { getCurrentUser } from "@/repositories/auth/session";
import { findAllModules } from "@/repositories/modules";
import { INavItem, ISidebarNavItem } from "@/types";

import { canAccessCoreFeatures } from "@/lib/permissions/core-access";

/**
 * Get active modules for navigation
 * Only returns modules if user has core project access
 */
export async function getActiveModulesForNavigation(
  projectId: string | null,
): Promise<
  Array<{
    id: string;
    slug: string;
    name: string;
    icon: string | null;
  }>
> {
  if (!projectId) {
    return [];
  }

  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  try {
    // Check if user has access to core features
    const hasCoreAccess = await canAccessCoreFeatures(projectId, user.id);
    if (!hasCoreAccess) {
      return [];
    }

    // Get all active modules
    const modules = await findAllModules();
    return modules
      .filter((m) => m.isActive)
      .map((m) => ({
        id: m.id,
        slug: m.slug,
        name: m.name,
        icon: m.icon,
      }));
  } catch (error) {
    console.error("Error getting active modules for navigation:", error);
    return [];
  }
}

/**
 * Get navigation links with core modules section added
 * Server Action that can be called from Client Components
 */
export async function getNavigationLinksWithModules(
  links: ISidebarNavItem[],
  pathname: string,
): Promise<ISidebarNavItem[]> {
  // Extract projectId from pathname
  const projectIdMatch = pathname.match(/\/project\/([^/]+)/);
  const matchedId = projectIdMatch?.[1] || null;
  const knownRoutes = ["settings", "projects"];
  const currentProjectId =
    matchedId && !knownRoutes.includes(matchedId) ? matchedId : null;

  // Get active modules if we have a projectId
  const activeModules = await getActiveModulesForNavigation(currentProjectId);

  // Create core modules section if there are modules
  const coreModulesSection: ISidebarNavItem | null =
    activeModules.length > 0
      ? {
          title: "CORE",
          authorizeOnly: "CORE",
          items: [
            {
              href: "/admin",
              icon: "shield",
              title: "Admin Mode",
              authorizeOnly: "CORE",
            } as INavItem,
          ],
        }
      : null;

  // Combine static links with dynamic core modules section
  return coreModulesSection ? [...links, coreModulesSection] : links;
}
