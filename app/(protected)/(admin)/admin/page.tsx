import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";

export const metadata = constructMetadata({
  title: "Admin Dashboard",
  description: "Global System Administration",
});

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-5">
      <DashboardHeader
        heading="System Administration"
        text="Manage global settings, users, and permissions."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6">
            <h3 className="font-semibold leading-none tracking-tight">Users</h3>
            <p className="text-sm text-muted-foreground">Manage system users</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6">
            <h3 className="font-semibold leading-none tracking-tight">Plans</h3>
            <p className="text-sm text-muted-foreground">Configure pricing</p>
          </div>
        </div>
      </div>
    </div>
  );
}
