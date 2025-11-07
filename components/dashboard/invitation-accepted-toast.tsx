"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

/**
 * Inner component that uses useSearchParams (requires Suspense boundary)
 */
function InvitationAcceptedToastInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const invitationAccepted = searchParams.get("invitation");

    if (invitationAccepted === "accepted") {
      // Show success toast
      toast.success("Invitation accepted!", {
        description: "You've successfully joined this project.",
        duration: 5000,
      });

      // Clean up the URL parameter to avoid showing the toast again on refresh
      const url = new URL(window.location.href);
      url.searchParams.delete("invitation");
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [searchParams, router]);

  return null;
}

/**
 * Component to show a success toast when a user accepts an invitation
 * and is redirected to the project dashboard
 * Wrapped in Suspense because useSearchParams requires it
 */
export function InvitationAcceptedToast() {
  return (
    <Suspense fallback={null}>
      <InvitationAcceptedToastInner />
    </Suspense>
  );
}
