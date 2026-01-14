"use client";

import { useEffect, useState } from "react";
import { getNavigationLinksWithModules } from "@/actions/modules/navigation";
import { ISidebarNavItem } from "@/types";

import { NavigationSection } from "./section";

interface INavigationSectionsProps {
  links: ISidebarNavItem[];
  isSidebarExpanded: boolean;
  path: string;
}

export function Navigation({
  links,
  isSidebarExpanded,
  path,
}: INavigationSectionsProps) {
  // Extract projectId from pathname if viewing a project
  const projectIdMatch = path.match(/\/project\/([^/]+)/);
  const matchedId = projectIdMatch?.[1] || null;

  // List of known routes that are NOT projectIds
  const knownRoutes = ["settings", "projects"];
  const currentProjectId =
    matchedId && !knownRoutes.includes(matchedId) ? matchedId : null;

  const [isCurrentProjectOwner, setIsCurrentProjectOwner] = useState(false);
  const [fallbackProjectId, setFallbackProjectId] = useState<string | null>(
    null,
  );
  const [enhancedLinks, setEnhancedLinks] = useState<ISidebarNavItem[]>(links);

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

  // Load enhanced links with core modules
  useEffect(() => {
    async function loadEnhancedLinks() {
      try {
        const enhanced = await getNavigationLinksWithModules(links, path);
        setEnhancedLinks(enhanced);
      } catch (error) {
        console.error("Error loading enhanced links:", error);
        setEnhancedLinks(links);
      }
    }

    loadEnhancedLinks();
  }, [links, path]);

  // Check if user is OWNER of current project (only once, shared across all sections)
  useEffect(() => {
    async function checkProjectAccess() {
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
        console.error("Error checking project access:", error);
        setIsCurrentProjectOwner(false);
      }
    }

    checkProjectAccess();
  }, [currentProjectId, fallbackProjectId]);

  // Use currentProjectId if available, otherwise use fallbackProjectId
  const effectiveProjectId = currentProjectId || fallbackProjectId;
  const hasExplicitProject = Boolean(currentProjectId);

  const sections = enhancedLinks.map((section, index) => {
    const isLastSection = index === links.length - 1;

    return (
      <div key={section.title}>
        <NavigationSection
          section={section}
          isSidebarExpanded={isSidebarExpanded}
          path={path}
          projectId={effectiveProjectId}
          hasExplicitProject={hasExplicitProject}
          isCurrentProjectOwner={isCurrentProjectOwner}
        />
      </div>
    );
  });

  return <>{sections}</>;
}
