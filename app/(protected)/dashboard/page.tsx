import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/repositories/auth/session";
import { findAllUserProjects } from "@/repositories/projects";

import { constructMetadata } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard/header";
import { Icons } from "@/components/shared/icons";

export const metadata = constructMetadata({
  title: "Dashboard – SaaS Starter",
  description: "Manage your projects and collaborate with your team.",
});

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Get all user projects
  const projects = await findAllUserProjects(user.id);

  // If user has exactly one project, redirect to it
  if (projects.length === 1) {
    redirect(`/dashboard/${projects[0].id}`);
  }

  return (
    <>
      <DashboardHeader
        heading="My Projects"
        text={`You have ${projects.length} project${projects.length !== 1 ? "s" : ""}. Select one to get started.`}
      />
      {projects.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Projects</CardTitle>
            <CardDescription>
              You don&apos;t have any projects yet. A personal project will be
              created automatically when you complete registration.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/dashboard/${project.id}`}>
              <Card className="transition-silver hover-lift hover:shadow-silver/10 hover:border-primary/50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Icons.package className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                  </div>
                  <CardDescription>
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                  >
                    Open Project
                    <Icons.arrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
