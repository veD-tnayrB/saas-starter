"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { ISidebarNavItem } from "@/types";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Icons } from "@/components/shared/icons";

export function SearchCommand({ links }: { links: ISidebarNavItem[] }) {
  const [open, setOpen] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [fallbackProjectId, setFallbackProjectId] = React.useState<
    string | null
  >(null);

  const projectIdMatch = pathname.match(/\/dashboard\/([^/]+)/);
  const matchedId = projectIdMatch?.[1] || null;
  const staticSegments = new Set(["settings", "projects"]);
  const currentProjectId =
    matchedId && !staticSegments.has(matchedId) ? matchedId : null;

  React.useEffect(() => {
    async function loadFallbackProject() {
      if (currentProjectId) {
        setFallbackProjectId(null);
        return;
      }

      try {
        const response = await fetch("/api/projects");
        if (response.ok) {
          const data = await response.json();
          const firstProject = data.projects?.[0];
          if (firstProject?.id) {
            setFallbackProjectId(firstProject.id);
          }
        }
      } catch (error) {
        console.error("Error fetching fallback project:", error);
        setFallbackProjectId(null);
      }
    }

    loadFallbackProject();
  }, [currentProjectId]);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (!isMounted) return;

    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isMounted]);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  if (!isMounted) {
    return (
      <Button
        variant="outline"
        className={cn(
          "relative h-9 w-full justify-start rounded-md bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-72",
        )}
        onClick={() => setOpen(true)}
      >
        <span className="inline-flex">
          Search
          <span className="hidden sm:inline-flex">&nbsp;documentation</span>...
        </span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.45rem] hidden h-5 select-none items-center gap-1 rounded border border-border bg-surface px-1.5 font-mono text-[10px] font-medium text-foreground/80 opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "relative h-9 w-full justify-start rounded-md bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-72",
        )}
        onClick={() => setOpen(true)}
      >
        <span className="inline-flex">
          Search
          <span className="hidden sm:inline-flex">&nbsp;documentation</span>...
        </span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.45rem] hidden h-5 select-none items-center gap-1 rounded border border-border bg-surface px-1.5 font-mono text-[10px] font-medium text-foreground/80 opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {links.map((section) => (
            <CommandGroup key={section.title} heading={section.title}>
              {section.items.map((item) => {
                const Icon = Icons[item.icon || "arrowRight"];
                const projectId = currentProjectId || fallbackProjectId;
                const requiresProject =
                  typeof item.href === "string" &&
                  item.href.includes("[projectId]");
                const destination =
                  requiresProject && projectId
                    ? (item.href as string).replace("[projectId]", projectId)
                    : requiresProject
                      ? "/projects"
                      : (item.href as string);
                const isDisabled = requiresProject && !projectId;

                return (
                  <CommandItem
                    key={item.title}
                    disabled={isDisabled}
                    onSelect={() => {
                      if (isDisabled) return;
                      runCommand(() => router.push(destination));
                    }}
                  >
                    <Icon className="mr-2 size-5" />
                    {item.title}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
