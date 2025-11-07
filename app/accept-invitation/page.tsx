import { redirect } from "next/navigation";
import { invitationService } from "@/services/projects";

import { getCurrentUserId } from "@/lib/session";

interface AcceptInvitationPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function AcceptInvitationPage({
  searchParams,
}: AcceptInvitationPageProps) {
  const userId = await getCurrentUserId();
  const { token } = await searchParams;

  if (!token) {
    redirect("/dashboard?error=Invalid invitation token");
  }

  // If user is not logged in, redirect to login
  if (!userId) {
    redirect(
      `/login?callbackUrl=${encodeURIComponent(`/accept-invitation?token=${token}`)}`,
    );
  }

  try {
    // Accept invitation
    const result = await invitationService.acceptInvitation(token, userId);

    // Redirect to project dashboard
    redirect(`/dashboard/${result.projectId}`);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to accept invitation";
    redirect(`/dashboard?error=${encodeURIComponent(errorMessage)}`);
  }
}
