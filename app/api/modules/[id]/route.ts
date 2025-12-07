import { NextResponse } from "next/server";
import { getModuleById } from "@/actions/modules";
import { getCurrentUserId } from "@/lib/session";

/**
 * GET /api/modules/[id]
 * Get a specific module by ID with actions
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id: moduleId } = await params;
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 },
      );
    }

    // Get module with actions (action enforces core access)
    let module;
    try {
      const result = await getModuleById(moduleId, projectId);
      module = result.module;
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === "Forbidden" || error.message.includes("Access denied"))
      ) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      throw error;
    }

    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    return NextResponse.json({ module }, { status: 200 });
  } catch (error) {
    console.error("Error getting module:", error);
    return NextResponse.json(
      { error: "Failed to get module" },
      { status: 500 },
    );
  }
}





