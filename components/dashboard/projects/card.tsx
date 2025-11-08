import { cn, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DeleteProjectButton } from "@/components/dashboard/projects/delete-button";
import { EditProjectButton } from "@/components/dashboard/projects/edit-button";

export interface IProjectCardData {
  id: string;
  name: string;
  createdAt: Date;
  planName: string;
  ownerName: string;
  isOwner: boolean;
}

interface IProjectCardProps extends IProjectCardData {
  isCurrent?: boolean;
}

export function ProjectCard({
  id,
  name,
  createdAt,
  planName,
  ownerName,
  isOwner,
  isCurrent = false,
}: IProjectCardProps) {
  return (
    <Card
      className={cn(
        "border-border bg-card/60 backdrop-blur",
        isCurrent && "border-primary ring-1 ring-primary/40",
      )}
    >
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-base font-semibold text-foreground">{name}</h3>
            <Badge variant="outline" className="text-xs">
              {planName}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Owner:{" "}
            <span className="font-medium text-foreground">{ownerName}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Created on {formatDate(createdAt.getTime())}
          </p>
        </div>
        {isOwner && (
          <div className="flex items-center gap-2">
            <EditProjectButton projectId={id} currentName={name} />
            <DeleteProjectButton projectId={id} projectName={name} />
          </div>
        )}
      </div>
    </Card>
  );
}
