import { redirect } from "next/navigation";
import { getCurrentUser } from "@/repositories/auth/session";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/project");
  }

  return <div className="min-h-screen">{children}</div>;
}
