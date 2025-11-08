import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProjectStatsSkeleton() {
  const cards = Array.from({ length: 4 }).map((_, idx) => (
    <Card key={idx}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          <Skeleton className="h-4 w-24" />
        </CardTitle>
        <Skeleton className="size-4 rounded-full" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-3 w-full max-w-[220px]" />
        <Skeleton className="h-3 w-full max-w-[140px]" />
      </CardContent>
    </Card>
  ));

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{cards}</div>
  );
}
