import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProjectsSkeleton() {
  const projectCards = Array.from({ length: 3 }).map((_, idx) => (
    <Card key={idx} className="border-border bg-card/60 backdrop-blur">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-3 w-56" />
          <Skeleton className="h-3 w-40" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="size-9 rounded-md" />
          <Skeleton className="size-9 rounded-md" />
        </div>
      </div>
    </Card>
  ));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>
      <div className="space-y-3">{projectCards}</div>
    </div>
  );
}
