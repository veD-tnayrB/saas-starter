"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Home, LayoutGrid, LogOut, Settings } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Drawer } from "vaul";

import { IAuthUser } from "@/types/auth/user";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/shared/user-avatar";

export function UserAccountNav() {
  const { status, data: session } = useSession();
  const user = session?.user as IAuthUser;

  const [open, setOpen] = useState(false);
  const closeDrawer = () => {
    setOpen(false);
  };

  const { isMobile } = useMediaQuery();

  // Show loading state while session is loading
  if (status === "loading") {
    return (
      <div className="size-8 animate-pulse rounded-full border bg-muted" />
    );
  }

  // Show loading state if no user (but session is loaded)
  if (!user) {
    return (
      <div className="size-8 animate-pulse rounded-full border bg-muted" />
    );
  }
  if (isMobile) {
    return (
      <Drawer.Root open={open} onClose={closeDrawer}>
        <Drawer.Trigger asChild>
          <button onClick={() => setOpen(true)} className="rounded-full">
            <UserAvatar
              user={{
                name: user.name || null,
                email: user.email || null,
                image: user.image || null,
              }}
              className="size-9 border"
            />
          </button>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay
            className="fixed inset-0 z-40 h-full bg-background/80 backdrop-blur-sm"
            onClick={closeDrawer}
          />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mt-24 overflow-hidden rounded-t-[10px] border bg-background px-3 text-sm">
            <div className="sticky top-0 z-20 flex w-full items-center justify-center bg-inherit">
              <div className="my-3 h-1.5 w-16 rounded-full bg-muted-foreground/20" />
            </div>

            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col">
                {user.name && <p className="font-medium">{user.name}</p>}
                {user.email && (
                  <p className="w-[200px] truncate text-muted-foreground">
                    {user?.email}
                  </p>
                )}
              </div>
            </div>

            <ul role="list" className="mb-14 mt-1 w-full text-muted-foreground">
              <li className="rounded-lg text-foreground hover:bg-muted">
                <Link
                  href="/"
                  onClick={closeDrawer}
                  className="flex w-full items-center gap-3 px-2.5 py-2"
                >
                  <Home className="size-4" />
                  <p className="text-sm">Home</p>
                </Link>
              </li>

              <li className="rounded-lg text-foreground hover:bg-muted">
                <Link
                  href="/projects"
                  onClick={closeDrawer}
                  className="flex w-full items-center gap-3 px-2.5 py-2"
                >
                  <LayoutGrid className="size-4" />
                  <p className="text-sm">Projects</p>
                </Link>
              </li>

              <li className="rounded-lg text-foreground hover:bg-muted">
                <Link
                  href="/docs"
                  onClick={closeDrawer}
                  className="flex w-full items-center gap-3 px-2.5 py-2"
                >
                  <BookOpen className="size-4" />
                  <p className="text-sm">Documentation</p>
                </Link>
              </li>

              <li className="rounded-lg text-foreground hover:bg-muted">
                <Link
                  href="/settings"
                  onClick={closeDrawer}
                  className="flex w-full items-center gap-3 px-2.5 py-2"
                >
                  <Settings className="size-4" />
                  <p className="text-sm">Settings</p>
                </Link>
              </li>

              <li
                className="rounded-lg text-foreground hover:bg-muted"
                onClick={(event) => {
                  event.preventDefault();
                  signOut({
                    callbackUrl: `${window.location.origin}/`,
                  });
                }}
              >
                <div className="flex w-full items-center gap-3 px-2.5 py-2">
                  <LogOut className="size-4" />
                  <p className="text-sm">Log out </p>
                </div>
              </li>
            </ul>
          </Drawer.Content>
          <Drawer.Overlay />
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full">
          <UserAvatar
            user={{
              name: user.name || null,
              email: user.email || null,
              image: user.image || null,
            }}
            className="size-8 border"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user.name && <p className="font-medium">{user.name}</p>}
            {user.email && (
              <p className="w-[200px] truncate text-sm text-muted-foreground">
                {user?.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/" className="flex items-center space-x-2.5">
            <Home className="size-4" />
            <p className="text-sm">Home</p>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/projects" className="flex items-center space-x-2.5">
            <LayoutGrid className="size-4" />
            <p className="text-sm">Projects</p>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/docs" className="flex items-center space-x-2.5">
            <BookOpen className="size-4" />
            <p className="text-sm">Documentation</p>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center space-x-2.5">
            <Settings className="size-4" />
            <p className="text-sm">Settings</p>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={(event) => {
            event.preventDefault();
            signOut({
              callbackUrl: `${window.location.origin}/`,
            });
          }}
        >
          <div className="flex items-center space-x-2.5">
            <LogOut className="size-4" />
            <p className="text-sm">Log out </p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
