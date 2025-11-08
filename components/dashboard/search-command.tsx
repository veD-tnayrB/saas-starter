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

type IconKey = keyof typeof Icons;

interface ICommandOption {
  key: string;
  title: string;
  icon: IconKey;
  destination: string;
  isDisabled: boolean;
}

interface ICommandSection {
  title: string;
  options: ICommandOption[];
}

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

    const down = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((prevState) => !prevState);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isMounted]);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  const commandSections = React.useMemo(() => {
    const sections: ICommandSection[] = [];
    const projectId = currentProjectId || fallbackProjectId;

    for (const section of links) {
      const options: ICommandOption[] = [];

      for (const item of section.items) {
        if (typeof item.href !== "string") continue;

        const iconKey = (item.icon || "arrowRight") as IconKey;
        const requiresProject = item.href.includes("[projectId]");
        const destination =
          requiresProject && projectId
            ? item.href.replace("[projectId]", projectId)
            : requiresProject
              ? "/projects"
              : item.href;

        options.push({
          key: `${section.title}-${item.title}`,
          title: item.title,
          icon: iconKey,
          destination,
          isDisabled: requiresProject && !projectId,
        });
      }

      sections.push({
        title: section.title,
        options,
      });
    }

    return sections;
  }, [currentProjectId, fallbackProjectId, links]);

  const renderedSections = React.useMemo(() => {
    const groups: React.ReactNode[] = [];

    for (const section of commandSections) {
      const items: React.ReactNode[] = [];

      for (const option of section.options) {
        const Icon = Icons[option.icon];
        items.push(
          <CommandItem
            key={option.key}
            disabled={option.isDisabled}
            onSelect={() => {
              if (option.isDisabled) return;
              runCommand(() => router.push(option.destination));
            }}
          >
            <Icon className="mr-2 size-5" />
            {option.title}
          </CommandItem>,
        );
      }

      if (items.length > 0) {
        groups.push(
          <CommandGroup key={section.title} heading={section.title}>
            {items}
          </CommandGroup>,
        );
      }
    }

    return groups;
  }, [commandSections, router, runCommand]);

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
          {renderedSections}
        </CommandList>
      </CommandDialog>
    </>
  );
}
