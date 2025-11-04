"use client";

import { useEffect, useState } from "react";
import { SidebarNavItem } from "@/types";

import { NavigationSection } from "./section";

interface INavigationSectionsProps {
  links: SidebarNavItem[];
  isSidebarExpanded: boolean;
  path: string;
}

export function NavigationSections({
  links,
  isSidebarExpanded,
  path,
}: INavigationSectionsProps) {
  // Extract projectId from pathname if viewing a project
  const projectIdMatch = path.match(/\/dashboard\/([^/]+)/);
  const matchedId = projectIdMatch?.[1] || null;

  // List of known routes that are NOT projectIds
  const knownRoutes = ["settings", "billing"];
  const currentProjectId =
    matchedId && !knownRoutes.includes(matchedId) ? matchedId : null;

  const [isCurrentProjectOwner, setIsCurrentProjectOwner] = useState(false);
  const [fallbackProjectId, setFallbackProjectId] = useState<string | null>(
    null,
  );

  // Get first project as fallback when no currentProjectId
  useEffect(() => {
    async function getFirstProject() {
      if (currentProjectId) {
        // If we have a currentProjectId, we don't need fallback
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
        console.error("Error getting first project:", error);
        setFallbackProjectId(null);
      }
    }

    getFirstProject();
  }, [currentProjectId]);

  // Check if user is OWNER of current project (only once, shared across all sections)
  useEffect(() => {
    async function checkOwnerRole() {
      const projectIdToCheck = currentProjectId || fallbackProjectId;
      if (!projectIdToCheck) {
        setIsCurrentProjectOwner(false);
        return;
      }

      try {
        const response = await fetch(`/api/projects/${projectIdToCheck}`);
        if (response.ok) {
          const data = await response.json();
          setIsCurrentProjectOwner(data.project?.userRole === "OWNER");
        }
      } catch (error) {
        console.error("Error checking owner role:", error);
        setIsCurrentProjectOwner(false);
      }
    }

    checkOwnerRole();
  }, [currentProjectId, fallbackProjectId]);

  // Use currentProjectId if available, otherwise use fallbackProjectId
  const effectiveProjectId = currentProjectId || fallbackProjectId;

  const sections = links.map((section, index) => {
    const isLastSection = index === links.length - 1;

    return (
      <div key={section.title} className={isLastSection ? "mt-auto" : ""}>
        <NavigationSection
          section={section}
          isSidebarExpanded={isSidebarExpanded}
          path={path}
          currentProjectId={effectiveProjectId}
          isCurrentProjectOwner={isCurrentProjectOwner}
        />
      </div>
    );
  });

  return <>{sections}</>;
}
