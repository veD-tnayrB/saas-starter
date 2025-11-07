import { userAuthService } from "@/services/auth";

import { getCurrentUser } from "@/lib/session";

export async function DELETE(req: Request, context: { params: Promise<{}> }) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return new Response("Not authenticated", { status: 401 });
  }

  if (!currentUser.id) {
    return new Response("Invalid user ID", { status: 400 });
  }

  try {
    // Use the new service layer to delete user
    await userAuthService.deleteUser(currentUser.id);
  } catch (error) {
    return new Response("Internal server error", { status: 500 });
  }

  return new Response("User deleted successfully!", { status: 200 });
}
