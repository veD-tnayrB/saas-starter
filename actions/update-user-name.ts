"use server";

import { revalidatePath } from "next/cache";
import NextAuth from "@/auth";
import { userAuthService } from "@/services/auth";
import { getServerSession } from "next-auth";

import { userNameSchema } from "@/lib/validations/user";

export type FormData = {
  name: string;
};

export async function updateUserName(userId: string, data: FormData) {
  try {
    const session = await getServerSession(NextAuth);

    if (!session?.user || session?.user.id !== userId) {
      throw new Error("Unauthorized");
    }

    const { name } = userNameSchema.parse(data);

    // Update the user name using the new service layer
    await userAuthService.updateUserProfile(userId, { name });

    revalidatePath("/dashboard/settings");
    return { status: "success" };
  } catch (error) {
    // console.log(error)
    return { status: "error" };
  }
}
