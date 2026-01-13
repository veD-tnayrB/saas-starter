"use server";

import { findActivePlans } from "@/repositories/permissions/plans";

export async function getActivePlansAction() {
  try {
    const plans = await findActivePlans();
    return { plans };
  } catch (error) {
    console.error("Error getting active plans:", error);
    return { plans: [] };
  }
}
