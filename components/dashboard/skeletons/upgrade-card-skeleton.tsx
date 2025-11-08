import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function UpgradeCardSkeleton() {
  return (
    <Card className="md:max-xl:rounded-none md:max-xl:border-none md:max-xl:shadow-none">
      <CardHeader className="md:max-xl:px-4">
        <CardTitle>
          <Skeleton className="h-5 w-32" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-3 w-56" />
        </CardDescription>
      </CardHeader>
      <CardContent className="md:max-xl:px-4">
        <Skeleton className="h-9 w-full rounded-md" />
      </CardContent>
    </Card>
  );
}
