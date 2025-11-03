import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative animate-pulse overflow-hidden rounded-md bg-muted",
        "before:animate-shimmer before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
        "dark:before:via-white/10",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
