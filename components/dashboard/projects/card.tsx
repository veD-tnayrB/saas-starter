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
        "glass-card hover-lift transition-all duration-300",
        isCurrent && "border-primary/50 bg-primary/5 ring-2 ring-primary/20",
      )}
    >
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-bold tracking-tight text-foreground/90">
              {name}
            </h3>
            <Badge
              variant="outline"
              className="border-primary/20 bg-primary/5 text-[10px] font-bold uppercase tracking-wider text-primary"
            >
              {planName}
            </Badge>
            {isCurrent && (
              <Badge className="bg-primary text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                Current
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground/80">
            Owner:{" "}
            <span className="font-semibold text-foreground/70">
              {ownerName}
            </span>
          </p>
          <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-tight text-muted-foreground/50">
            <span>Created on {formatDate(createdAt.getTime())}</span>
          </div>
        </div>
        {isOwner && (
          <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <EditProjectButton projectId={id} currentName={name} />
            <DeleteProjectButton projectId={id} projectName={name} />
          </div>
        )}
      </div>
    </Card>
  );
}
