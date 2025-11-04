import { redirect } from "next/navigation";
import { getCurrentUser } from "@/repositories/auth/session";
import { isPlatformAdmin } from "@/services/auth/platform-admin";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function Dashboard({ children }: ProtectedLayoutProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const userIsAdmin = await isPlatformAdmin(user.id);
  if (!userIsAdmin) redirect("/dashboard");

  return <>{children}</>;
}
