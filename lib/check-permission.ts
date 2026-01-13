import { auth } from "@/auth";
import { permissionService } from "@/services/permissions/permission-service";

/**
 * Utility to check permission and throw error if not authorized
 * Best used in Server Actions or Server Components
 */
export async function checkPermission(
  projectId: string,
  actionSlug: string,
  throwError: boolean = true,
): Promise<boolean> {
  const session = await auth();

  if (!session?.user?.id) {
    if (throwError) throw new Error("Unauthorized");
    return false;
  }

  const hasPermission = await permissionService.canUserPerformAction(
    session.user.id,
    projectId,
    actionSlug,
  );

  if (!hasPermission && throwError) {
    throw new Error(`Forbidden: Missing permission for ${actionSlug}`);
  }

  return hasPermission;
}
