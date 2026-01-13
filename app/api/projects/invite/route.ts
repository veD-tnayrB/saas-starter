import { NextResponse } from "next/server";
import { invitationService, memberService } from "@/services/projects";
import { auditLogService } from "@/services/projects/audit-log-service";
import { z } from "zod";

import { canInviteMembers } from "@/lib/project-roles";
import { getCurrentUserId } from "@/lib/session";

const inviteSchema = z.object({
  projectId: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER"]).optional(), // Backward compatibility
  roles: z.array(z.enum(["OWNER", "ADMIN", "MEMBER"])).optional(), // New: multiple roles
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

    const { projectId, email, role, roles } = parsed.data;

    // Check if user has permission to invite (ADMIN or OWNER)
    const userRoles = await memberService.getUserRoles(projectId, userId);
    const canInvite = userRoles.some((r) => canInviteMembers(r));
    if (!canInvite) {
      return NextResponse.json(
        { error: "You don't have permission to invite members" },
        { status: 403 },
      );
    }

    // Determine roles to assign (prefer roles array, fallback to single role for backward compatibility)
    const roleNames =
      roles && roles.length > 0 ? roles : role ? [role] : ["MEMBER"];

    // Create and send invitation
    const invitation = await invitationService.createInvitation(
      projectId,
      email,
      roleNames,
      userId,
    );

    // Record audit log
    await auditLogService.logMemberInvite(
      projectId,
      userId,
      email,
      roleNames.join(", "),
    );

    return NextResponse.json(
      {
        success: true,
        invitation: {
          id: invitation.id,
          email: invitation.email,
          roles: invitation.roles.map((r) => r.name),
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
