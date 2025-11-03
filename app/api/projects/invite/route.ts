import { NextResponse } from "next/server";
import NextAuth from "@/auth";
import { invitationService, memberService } from "@/services/projects";
import type { ProjectRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { z } from "zod";

const inviteSchema = z.object({
  projectId: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"]),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(NextAuth);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = inviteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.errors },
        { status: 400 },
      );
    }

    const { projectId, email, role } = parsed.data;

    // Check if user has permission to invite (ADMIN or OWNER)
    const userRole = await memberService.getUserRole(
      projectId,
      session.user.id,
    );
    if (!userRole || (userRole !== "OWNER" && userRole !== "ADMIN")) {
      return NextResponse.json(
        { error: "You don't have permission to invite members" },
        { status: 403 },
      );
    }

    // Create and send invitation
    const invitation = await invitationService.createInvitation(
      projectId,
      email,
      role as ProjectRole,
      session.user.id,
    );

    return NextResponse.json(
      {
        success: true,
        invitation: {
          id: invitation.id,
          email: invitation.email,
          role: invitation.role,
          expiresAt: invitation.expiresAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating invitation:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create invitation",
      },
      { status: 500 },
    );
  }
}
