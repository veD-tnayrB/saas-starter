"use client";

import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function AdminSidebarHeader({ isCollapsed }: { isCollapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="w-full justify-start gap-2"
      >
        <Link href="/project">
          <ArrowLeft className="size-4" />
          {!isCollapsed && <span className="font-semibold">Exit Admin</span>}
        </Link>
      </Button>
    </div>
  );
}

export function AdminHeaderBadge() {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex cursor-help items-center gap-2 rounded-full bg-[hsl(var(--warning)/0.1)] px-3 py-1 text-xs font-medium text-[hsl(var(--warning))] ring-1 ring-inset ring-[hsl(var(--warning)/0.2)]">
            <ShieldAlert className="size-3.5" />
            <span>System Admin Mode</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs text-center text-xs">
            Warning: Any modifications made in this section will affect the
            entire system, all projects, and all clients. Please proceed with
            discretion.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
