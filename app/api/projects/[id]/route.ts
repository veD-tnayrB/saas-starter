import { NextResponse } from "next/server";
import { memberService, projectService } from "@/services/projects";
import { z } from "zod";

import { getCurrentUserId } from "@/lib/session";

/**
 * Schema for updating a project
 */
const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  members: z
    .array(
      z.object({
        email: z.string().email("Invalid email address"),
        role: z.enum(["OWNER", "ADMIN", "MEMBER"]),
        action: z.enum(["add", "update", "remove"]),
      }),
    )
    .optional(),
});

/**
 * GET /api/projects/[id]
 * Get a specific project by ID
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

    const { id: projectId } = await params;

    // Get project (service will enforce authorization)
    let project;
    try {
      project = await projectService.getProjectById(projectId, userId);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Project not found or access denied"
      ) {
        return NextResponse.json(
          { error: "Project not found or access denied" },
          { status: 404 },
        );
      }
      throw error;
    }

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Get user role and members
    const userRole = await memberService.getUserRole(projectId, userId);
    const members = await memberService.getProjectMembers(projectId);

    return NextResponse.json(
      {
        project: {
          ...project,
          userRole,
          members,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error getting project:", error);
    return NextResponse.json(
      { error: "Failed to get project" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/projects/[id]
 * Update a project
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id: projectId } = await params;
    const body = await req.json();
    const parsed = updateProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.errors },
        { status: 400 },
      );
    }

    const { name, members } = parsed.data;

    // Update project
    const project = await projectService.updateProject(
      projectId,
      {
        name,
        members: members as
          | Array<{
              email: string;
              role: string;
              action: "add" | "update" | "remove";
            }>
          | undefined,
      },
      userId,
    );

    return NextResponse.json(
      {
        success: true,
        project: {
          id: project.id,
          name: project.name,
          ownerId: project.ownerId,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
          members: project.members,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update project",
      },
      {
        status:
          error instanceof Error && error.message.includes("permission")
            ? 403
            : 500,
      },
    );
  }
}

/**
 * DELETE /api/projects/[id]
 * Delete a project (only OWNER can delete)
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id: projectId } = await params;

    // Delete project (service checks OWNER permission)
    await projectService.deleteProject(projectId, userId);

    return NextResponse.json(
      { success: true, message: "Project deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete project",
      },
      {
        status:
          error instanceof Error && error.message.includes("owner") ? 403 : 500,
      },
    );
  }
}
