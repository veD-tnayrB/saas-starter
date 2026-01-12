interface DashboardHeaderProps {
  heading: string;
  text?: string;
  children?: React.ReactNode;
}

export function DashboardHeader({
  heading,
  text,
  children,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-1 py-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="grid gap-1.5">
        <h1 className="text-gradient text-3xl font-bold tracking-tight sm:text-4xl">
          {heading}
        </h1>
        {text && (
          <p className="max-w-[600px] leading-relaxed text-muted-foreground sm:text-lg">
            {text}
          </p>
        )}
      </div>
      {children && <div className="mt-4 sm:mt-0">{children}</div>}
    </div>
  );
}
