"use client";

import { Fragment } from "react";
import Link from "next/link";
import { ISidebarNavItem } from "@/types";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Icons } from "@/components/shared/icons";

interface INavigationItemProps {
  item: ISidebarNavItem["items"][number];
  isSidebarExpanded: boolean;
  path: string;
  href: string;
  isFallback: boolean;
}

export function NavigationItem({
  item,
  isSidebarExpanded,
  path,
  href,
  isFallback,
}: INavigationItemProps) {
  const Icon = Icons[item.icon || "arrowRight"];
  const resolvedHref = href;
  const normalizedPath = path.endsWith("/") ? path.slice(0, -1) : path;
  const normalizedHref = resolvedHref.endsWith("/")
    ? resolvedHref.slice(0, -1)
    : resolvedHref;
  const isActive =
    !isFallback &&
    (normalizedPath === normalizedHref ||
      normalizedPath.startsWith(`${normalizedHref}/`));
  const iconClass = isActive ? "text-foreground" : "text-foreground/70";
  const linkClass = cn(
    "flex items-center gap-3 rounded-md p-2 text-sm font-medium transition-colors hover:bg-muted",
    isActive
      ? "bg-muted text-foreground"
      : "text-foreground/70 hover:text-foreground",
    item.disabled &&
      "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-foreground/50",
  );
  const tooltipLinkClass = cn(
    "flex items-center gap-3 rounded-md py-2 text-sm font-medium transition-colors hover:bg-muted",
    isActive
      ? "bg-muted text-foreground"
      : "text-foreground/70 hover:text-foreground",
    item.disabled &&
      "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-foreground/50",
  );
  const linkHref = item.disabled ? "#" : resolvedHref;
  const hasBadge = !!item.badge;

  const expandedContent = (
    <Link key={`link-${item.title}`} href={linkHref} className={linkClass}>
      <Icon className={cn("size-5", iconClass)} />
      {item.title}
      {hasBadge && (
        <Badge className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-full">
          {item.badge}
        </Badge>
      )}
    </Link>
  );

  const collapsedContent = (
    <Tooltip key={`tooltip-${item.title}`}>
      <TooltipTrigger asChild>
        <Link
          key={`link-tooltip-${item.title}`}
          href={linkHref}
          className={tooltipLinkClass}
          prefetch={false}
        >
          <span className="flex size-full items-center justify-center">
            <Icon className={cn("size-5", iconClass)} />
          </span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">{item.title}</TooltipContent>
    </Tooltip>
  );

  const content = isSidebarExpanded ? expandedContent : collapsedContent;

  return <Fragment key={`link-fragment-${item.title}`}>{content}</Fragment>;
}
