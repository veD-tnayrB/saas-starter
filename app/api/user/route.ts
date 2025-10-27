import { auth } from "@/auth";
import { userAuthService } from "@/services/auth";

export const DELETE = auth(async (req) => {
  if (!req.auth) {
    return new Response("Not authenticated", { status: 401 });
  }

  const currentUser = req.auth.user;
  if (!currentUser) {
    return new Response("Invalid user", { status: 401 });
  }

  try {
    // Use the new service layer to delete user
    if (!currentUser.id) {
      return new Response("Invalid user ID", { status: 400 });
    }
    await userAuthService.deleteUser(currentUser.id);
  } catch (error) {
    return new Response("Internal server error", { status: 500 });
  }

  return new Response("User deleted successfully!", { status: 200 });
});
