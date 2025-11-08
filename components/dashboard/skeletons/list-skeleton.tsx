import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface IListSkeletonProps {
  title: string;
  description?: string;
  items?: number;
}

export function ListSkeleton({
  title,
  description,
  items = 4,
}: IListSkeletonProps) {
  const listItems = Array.from({ length: items }).map((_, idx) => (
    <div
      key={idx}
      className="flex items-center justify-between gap-3 rounded-md border border-border/40 p-3"
    >
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-44" />
      </div>
      <Skeleton className="h-6 w-16 rounded-md" />
    </div>
  ));

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-sm text-muted-foreground">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">{listItems}</CardContent>
    </Card>
  );
}
