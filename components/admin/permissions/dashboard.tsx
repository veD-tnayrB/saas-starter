import { PermissionsDashboardClient } from "./dashboard-client";

export async function PermissionsDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Permissions Management</h1>
        <p className="text-muted-foreground">
          Manage roles, actions, plans, and permissions for the application.
        </p>
      </div>

      <PermissionsDashboardClient />
    </div>
  );
}
