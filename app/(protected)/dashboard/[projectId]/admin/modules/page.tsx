import { redirect } from "next/navigation";
import { getCurrentUser } from "@/repositories/auth/session";
import { canAccessCoreFeatures } from "@/lib/permissions/core-access";
import { constructMetadata } from "@/lib/utils";
import { ModulesManagement } from "@/components/admin/modules/management";

interface IModulesPageProps {
  params: Promise<{ projectId: string }>;
}

export const metadata = constructMetadata({
  title: "Modules Management",
  description: "Manage application modules and their associated actions.",
});

// Force dynamic rendering to prevent caching issues
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ModulesPage({ params }: IModulesPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { projectId } = await params;

  // Verify user has access to core features
  const hasAccess = await canAccessCoreFeatures(projectId, user.id);
  if (!hasAccess) {
    redirect(`/dashboard/${projectId}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Modules Management</h1>
        <p className="text-muted-foreground">
          Manage application modules and their associated actions. Only visible
          to users in core projects.
        </p>
      </div>

      <ModulesManagement projectId={projectId} />
    </div>
  );
}





