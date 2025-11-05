import { NextResponse } from "next/server";
import NextAuth from "@/auth";
import { projectService } from "@/services/projects";
import { getServerSession } from "next-auth";
import { z } from "zod";

/**
 * Schema for creating a project
 */
const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project name too long"),
  members: z
    .array(
      z.object({
        email: z.string().email("Invalid email address"),
        role: z.enum(["OWNER", "ADMIN", "MEMBER"]),
      }),
    )
    .optional(),
});

/**
 * GET /api/projects
 * List all projects the current user belongs to
 */
export async function GET() {
  try {
    const session = await getServerSession(NextAuth);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const projects = await projectService.getUserProjects(session.user.id);

    return NextResponse.json({ projects }, { status: 200 });
  } catch (error) {
    console.error("Error listing projects:", error);
    return NextResponse.json(
      { error: "Failed to list projects" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/projects
 * Create a new project
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(NextAuth);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.errors },
        { status: 400 },
      );
    }

    const { name, members } = parsed.data;

    // Create project with optional initial members
    const project = await projectService.createProject({
      name,
      ownerId: session.user.id,
      members: members as Array<{ email: string; role: string }> | undefined,
    });

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
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create project",
      },
      { status: 500 },
    );
  }
}
