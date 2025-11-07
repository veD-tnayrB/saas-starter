import { redirect } from "next/navigation";
import { invitationService } from "@/services/projects";

import { getCurrentUserId } from "@/lib/session";

// Force dynamic rendering to prevent caching issues
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface AcceptInvitationPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function AcceptInvitationPage({
  searchParams,
}: AcceptInvitationPageProps) {
  const resolvedSearchParams = await searchParams;
  const token = resolvedSearchParams.token;

  if (!token || typeof token !== "string" || token.trim() === "") {
    console.error("Missing or invalid token in accept-invitation page");
    redirect("/dashboard?error=Invalid invitation token");
  }

  const userId = await getCurrentUserId();

  // If user is not logged in, redirect to login with callback
  if (!userId) {
    const callbackUrl = `/accept-invitation?token=${encodeURIComponent(token)}`;
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  try {
    console.log(
      "Accepting invitation for user:",
      userId,
      "with token:",
      token.substring(0, 8) + "...",
    );

    // Accept invitation
    const result = await invitationService.acceptInvitation(token, userId);

    if (!result?.projectId) {
      console.error(
        "No projectId returned from acceptInvitation. Result:",
        result,
      );
      redirect(
        "/dashboard?error=Failed to accept invitation: No project ID returned",
      );
    }

    console.log(
      "Invitation accepted successfully! Project ID:",
      result.projectId,
    );
    console.log(
      "Redirecting to:",
      `/dashboard/${result.projectId}?invitation=accepted`,
    );

    // Redirect to project dashboard with success message
    redirect(`/dashboard/${result.projectId}?invitation=accepted`);
  } catch (error) {
    // Re-throw redirect errors as-is (Next.js uses these internally)
    // NEXT_REDIRECT is not a real error, it's Next.js's way of handling redirects
    if (error && typeof error === "object" && "digest" in error) {
      const digest = String(error.digest);
      if (digest.startsWith("NEXT_REDIRECT")) {
        throw error;
      }
    }

    // This is a real error, handle it
    console.error("Error accepting invitation:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to accept invitation";
    console.error("Error details:", errorMessage);
    redirect(`/dashboard?error=${encodeURIComponent(errorMessage)}`);
  }
}
