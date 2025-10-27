"use server";

import { auth } from "@/auth";
import { userNameSchema } from "@/lib/validations/user";
import { revalidatePath } from "next/cache";
import { userAuthService } from "@/services/auth";

export type FormData = {
  name: string;
};

export async function updateUserName(userId: string, data: FormData) {
  try {
    const session = await auth()

    if (!session?.user || session?.user.id !== userId) {
      throw new Error("Unauthorized");
    }

    const { name } = userNameSchema.parse(data);

    // Update the user name using the new service layer
    await userAuthService.updateUserProfile(userId, { name });

    revalidatePath('/dashboard/settings');
    return { status: "success" };
  } catch (error) {
    // console.log(error)
    return { status: "error" }
  }
}