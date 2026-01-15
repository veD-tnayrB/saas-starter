import { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  actionComponent?: React.ReactNode; // New prop for custom action component
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionComponent, // Destructure new prop
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 p-12 text-center",
        className,
      )}
    >
      {Icon && (
        <div className="mb-4 rounded-full bg-muted p-3">
          <Icon className="size-6 text-muted-foreground" />
        </div>
      )}
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {actionComponent ? ( // Render actionComponent if provided
        <div className="mt-4">{actionComponent}</div>
      ) : (
        action && ( // Otherwise, render existing action button if provided
          <Button onClick={action.onClick} size="sm">
            {action.label}
          </Button>
        )
      )}
    </div>
  );
}
