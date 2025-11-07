import { NextResponse } from "next/server";
import { invitationService, memberService } from "@/services/projects";
import { z } from "zod";

import { canInviteMembers } from "@/lib/project-roles";
import { getCurrentUserId } from "@/lib/session";

const inviteSchema = z.object({
  projectId: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER"]),
});

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
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
    const userRole = await memberService.getUserRole(projectId, userId);
    if (!canInviteMembers(userRole)) {
      return NextResponse.json(
        { error: "You don't have permission to invite members" },
        { status: 403 },
      );
    }

    // Create and send invitation
    const invitation = await invitationService.createInvitation(
      projectId,
      email,
      role,
      userId,
    );

    return NextResponse.json(
      {
        success: true,
        invitation: {
          id: invitation.id,
          email: invitation.email,
          role: invitation.role.name,
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
