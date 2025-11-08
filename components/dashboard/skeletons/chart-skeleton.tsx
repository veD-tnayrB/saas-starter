import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ChartSkeleton({ title }: { title: string }) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Skeleton className="h-4 w-14" />
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-4">
        <Skeleton className="h-5 w-2/3" />
        <div className="flex flex-1 flex-col justify-end">
          <Skeleton className="h-[220px] w-full rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}
