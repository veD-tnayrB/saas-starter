"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import {
  isClientPlatformAdmin,
  isClientSystemAdmin,
} from "@/actions/auth/admin-actions";
import { isCurrentProjectOwner } from "@/actions/projects/is-owner-action";
import type { ISidebarNavItem } from "@/types";

import { filterNavigationItems } from "@/lib/navigation-auth";

import { Navigation } from "./";

interface IClientNavProps {
  links: ISidebarNavItem[];
  isSidebarExpanded: boolean;
}

export function ClientNav({ links, isSidebarExpanded }: IClientNavProps) {
  const params = useParams();
  const path = usePathname(); // Get pathname
  const projectId = params.projectId as string | undefined;

  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCore, setIsCore] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkPermissions() {
      setLoading(true);

      const ownerPromise = projectId
        ? isCurrentProjectOwner(projectId)
        : Promise.resolve(false);
      const adminPromise = isClientPlatformAdmin();
      const corePromise = isClientSystemAdmin();

      const [ownerResult, adminResult, coreResult] = await Promise.all([
        ownerPromise,
        adminPromise,
        corePromise,
      ]);

      setIsOwner(ownerResult);
      setIsAdmin(adminResult);
      setIsCore(coreResult);
      setLoading(false);
    }

    checkPermissions();
  }, [projectId]);

  if (loading) {
    // You might want a proper skeleton loader here
    return null;
  }

  const filteredLinks = links.map((section) => ({
    ...section,
    items: filterNavigationItems(section.items, isAdmin, isOwner, isCore),
  }));

  return (
    <Navigation
      links={filteredLinks}
      isSidebarExpanded={isSidebarExpanded}
      path={path} // Pass path to Navigation
    />
  );
}
