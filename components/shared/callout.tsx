import {
  AlertTriangle,
  Ban,
  CircleAlert,
  CircleCheckBig,
  FileText,
  Info,
  Lightbulb,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface CalloutProps {
  twClass?: string;
  children?: React.ReactNode;
  type?: keyof typeof dataCallout;
}

const dataCallout = {
  default: {
    icon: Info,
    classes: "border-border bg-muted/30 text-muted-foreground",
  },
  danger: {
    icon: CircleAlert,
    classes: "border-destructive/30 bg-destructive/10 text-destructive",
  },
  error: {
    icon: Ban,
    classes: "border-destructive/30 bg-destructive/10 text-destructive",
  },
  idea: {
    icon: Lightbulb,
    classes: "border-primary/30 bg-primary/10 text-primary",
  },
  info: {
    icon: Info,
    classes: "border-primary/30 bg-primary/10 text-primary",
  },
  note: {
    icon: FileText,
    classes: "border-primary/30 bg-primary/10 text-primary",
  },
  success: {
    icon: CircleCheckBig,
    classes: "border-primary/30 bg-primary/5 text-primary", // fallback for success
  },
  warning: {
    icon: AlertTriangle,
    classes: "border-warning/30 bg-warning/10 text-warning",
  },
};

export function Callout({
  children,
  twClass,
  type = "default",
  ...props
}: CalloutProps) {
  const { icon: Icon, classes } = dataCallout[type];
  return (
    <div
      className={cn(
        "mt-6 flex items-start space-x-3 rounded-lg border px-4 py-3 text-[15.6px] dark:border-none",
        classes,
        twClass,
      )}
      {...props}
    >
      <div className="mt-1 shrink-0">
        <Icon className="size-5" />
      </div>
      <div className="[&>p]:my-0">{children}</div>
    </div>
  );
}
