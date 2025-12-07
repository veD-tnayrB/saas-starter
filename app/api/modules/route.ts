import { NextResponse } from "next/server";
import { getCurrentUser } from "@/repositories/auth/session";
import { findAllModules } from "@/repositories/modules";

import { canAccessCoreFeatures } from "@/lib/permissions/core-access";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 },
      );
    }

    // Check if user has access to core features
    const hasCoreAccess = await canAccessCoreFeatures(projectId, user.id);
    if (!hasCoreAccess) {
      return NextResponse.json({ modules: [] }, { status: 200 });
    }

    // Get all active modules
    const modules = await findAllModules();
    const activeModules = modules.filter((m) => m.isActive);

    return NextResponse.json({ modules: activeModules }, { status: 200 });
  } catch (error) {
    console.error("Error getting modules:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to get modules",
      },
      { status: 500 },
    );
  }
}





