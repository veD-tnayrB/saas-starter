import Link from "next/link";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface IProjectNotFoundProps {
  firstProjectId?: string | null;
}

export function ProjectNotFound({ firstProjectId }: IProjectNotFoundProps) {
  const dashboardHref = firstProjectId
    ? `/project/${firstProjectId}/dashboard`
    : "/project";

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center space-y-6 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-muted">
          <Search className="size-10 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Project not found
          </h1>
          <p className="max-w-md text-muted-foreground">
            The project you're looking for doesn't exist or you don't have
            access to it.
          </p>
        </div>
        <Link
          href={dashboardHref}
          className={cn(buttonVariants({ variant: "default", size: "lg" }))}
        >
          Ir al Dashboard
        </Link>
      </div>
    </div>
  );
}
