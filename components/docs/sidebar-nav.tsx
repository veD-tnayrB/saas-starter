"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { docsConfig } from "@/config/docs";
import { cn } from "@/lib/utils";
import { INavItem } from "types";

export interface IDocsSidebarNavProps {
  setOpen?: (open: boolean) => void;
}

export function DocsSidebarNav({ setOpen }: IDocsSidebarNavProps) {
  const pathname = usePathname();
  const items = docsConfig.sidebarNav;

  if (items.length === 0) return null;

  const navGroups = items
    .map(function renderNavGroup(group) {
      if (!group.items || group.items.length === 0) return null;

      return (
        <div key={group.title} className="pb-8">
          <h4 className="mb-1 rounded-md py-1 text-base font-medium md:px-2 md:text-sm">
            {group.title}
          </h4>
          <DocsSidebarNavItems
            setOpen={setOpen}
            items={group.items}
            pathname={pathname}
          />
        </div>
      );
    })
    .filter(Boolean);

  return <div className="w-full">{navGroups}</div>;
}

interface IDocsSidebarNavItemsProps {
  items: INavItem[];
  pathname: string | null;
  setOpen?: (open: boolean) => void;
}

export function DocsSidebarNavItems({
  items,
  setOpen,
  pathname,
}: IDocsSidebarNavItemsProps) {
  if (!items || items.length === 0) return null;

  const navLinks = items.map(function renderNavItem(item) {
    const commonClasses =
      "flex w-full items-center rounded-md px-2 py-1.5 text-muted-foreground hover:underline";
    const activeClasses =
      pathname === item.href
        ? "font-medium text-blue-600 dark:text-blue-400"
        : "";

    if (item.disabled || !item.href) {
      return (
        <span
          key={`${item.title}${item.href ?? ""}`}
          className="flex w-full cursor-not-allowed items-center rounded-md px-2 py-1.5 opacity-60"
        >
          {item.title}
        </span>
      );
    }

    function handleClick() {
      if (setOpen) setOpen(false);
    }

    return (
      <Link
        key={`${item.title}${item.href}`}
        href={item.href}
        onClick={handleClick}
        className={cn(commonClasses, activeClasses)}
        target={item.external ? "_blank" : ""}
        rel={item.external ? "noreferrer" : ""}
      >
        {item.title}
      </Link>
    );
  });

  return (
    <div className="grid grid-flow-row auto-rows-max text-[15px] md:text-sm">
      {navLinks}
    </div>
  );
}
