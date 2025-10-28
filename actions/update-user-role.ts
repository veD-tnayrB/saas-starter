"use server";

import { revalidatePath } from "next/cache";
import NextAuth from "@/auth";
import { userAuthService } from "@/services/auth";
import { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";

import { userRoleSchema } from "@/lib/validations/user";

export type FormData = {
  role: UserRole;
};

export async function updateUserRole(userId: string, data: FormData) {
  try {
    const session = await getServerSession(NextAuth);

    if (!session?.user || session?.user.id !== userId) {
      throw new Error("Unauthorized");
    }

    const { role } = userRoleSchema.parse(data);

    // Update the user role using the new service layer
    await userAuthService.updateUserProfile(userId, { role });

    revalidatePath("/dashboard/settings");
    return { status: "success" };
  } catch (error) {
    // console.log(error)
    return { status: "error" };
  }
}
