import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface IProject {
  id: string;
  name: string;
  color: string;
}

// Color palette for project indicators
const projectColors = [
  "bg-primary",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-orange-500",
  "bg-cyan-500",
];

// Generate a consistent color for a project based on its ID
function getProjectColor(projectId: string): string {
  const hash = projectId.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return projectColors[Math.abs(hash) % projectColors.length];
}

export function useProjects() {
  const { status } = useSession();
  const [projects, setProjects] = useState<IProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    async function fetchProjects() {
      try {
        setLoading(true);
        const response = await fetch("/api/projects");
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        const data = await response.json();
        const formattedProjects: IProject[] = data.projects.map(
          function formatProject(project: any) {
            return {
              id: project.id,
              name: project.name,
              color: getProjectColor(project.id),
            };
          },
        );
        setProjects(formattedProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [status]);

  async function refreshProjects() {
    const response = await fetch("/api/projects");
    if (response.ok) {
      const data = await response.json();
      const formattedProjects: IProject[] = data.projects.map(
        function formatProject(project: any) {
          return {
            id: project.id,
            name: project.name,
            color: getProjectColor(project.id),
          };
        },
      );
      setProjects(formattedProjects);
    }
  }

  return { projects, loading, refreshProjects };
}
