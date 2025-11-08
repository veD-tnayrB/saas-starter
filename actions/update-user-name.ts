"use server";

import { revalidatePath } from "next/cache";
import { userAuthService } from "@/services/auth";

import { getCurrentUser } from "@/lib/session";
import { userNameSchema } from "@/lib/validations/user";

export type FormData = {
  name: string;
};

/**
 * Update user name action
 * @param userId - User ID to update
 * @param data - Form data containing new name
 * @returns Success or error status
 */
export async function updateUserName(userId: string, data: FormData) {
  try {
    const user = await getCurrentUser();

    if (!user || user.id !== userId) {
      throw new Error("Unauthorized");
    }

    const { name } = userNameSchema.parse(data);

    // Update the user name using the new service layer
    await userAuthService.updateUserProfile(userId, { name });

    // Revalidate paths where user info is displayed
    // Using "layout" to revalidate the entire layout tree
    revalidatePath("/settings", "layout");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/", "layout"); // Revalidate root if user info is shown there

    return { status: "success" };
  } catch (error) {
    // console.log(error)
    return { status: "error" };
  }
}
