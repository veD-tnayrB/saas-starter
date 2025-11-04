import { redirect } from "next/navigation";
import { getCurrentUser } from "@/repositories/auth/session";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  const user = await getCurrentUser();

  if (user) {
    const { isPlatformAdmin } = await import("@/lib/utils/platform-admin");
    const userIsAdmin = await isPlatformAdmin(user.id);
    if (userIsAdmin) redirect("/admin");
    redirect("/dashboard");
  }

  return <div className="min-h-screen">{children}</div>;
}
