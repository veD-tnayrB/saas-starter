"use client";

import { Fragment } from "react";
import Link from "next/link";
import { ISidebarNavItem } from "@/types";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/shared/icons";

interface IMobileNavigationItemProps {
  item: ISidebarNavItem["items"][number];
  path: string;
  onItemClick: () => void;
}

export function MobileNavigationItem({
  item,
  path,
  onItemClick,
}: IMobileNavigationItemProps) {
  const Icon = Icons[item.icon || "arrowRight"];
  const isActive = path === item.href;
  const iconClass = isActive ? "text-foreground" : "text-foreground/70";
  const linkClass = cn(
    "flex items-center gap-3 rounded-md p-2 text-sm font-medium transition-colors hover:bg-muted",
    isActive
      ? "bg-muted text-foreground"
      : "text-foreground/70 hover:text-foreground",
    item.disabled &&
      "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-foreground/50",
  );
  const linkHref = item.disabled ? "#" : item.href;
  const hasBadge = !!item.badge;

  function handleClick() {
    if (!item.disabled) {
      onItemClick();
    }
  }

  return (
    <Fragment key={`link-fragment-${item.title}`}>
      <Link
        key={`link-${item.title}`}
        onClick={handleClick}
        href={linkHref}
        className={linkClass}
        prefetch={false}
      >
        <Icon className={cn("size-5", iconClass)} />
        {item.title}
        {hasBadge && (
          <Badge className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-full">
            {item.badge}
          </Badge>
        )}
      </Link>
    </Fragment>
  );
}
